package com.bookgallery.server.service;

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.net.URISyntaxException;
import java.util.UUID;

@Service
public class BookImageStorageService {

    private static final Logger logger = LoggerFactory.getLogger(BookImageStorageService.class);
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024;
    private static final String URL_PREFIX = "/images/books/";

    private final Path uploadDirectory;

    public BookImageStorageService(@Value("${book-gallery.upload-dir:src/main/resources/static/images/books}") String uploadDirectory) {
        this.uploadDirectory = resolveUploadDirectory(uploadDirectory);
        try {
            Files.createDirectories(this.uploadDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not create the book cover directory", exception);
        }
        logger.info("Book cover storage directory: {}", this.uploadDirectory);
    }

    private static Path resolveUploadDirectory(String configuredPath) {
        Path path = Path.of(configuredPath);
        if (path.isAbsolute()) {
            return path.normalize();
        }

        return findApplicationDirectory().resolve(path).normalize();
    }

    private static Path findApplicationDirectory() {
        try {
            Path codeLocation = Path.of(BookImageStorageService.class.getProtectionDomain()
                    .getCodeSource().getLocation().toURI()).toAbsolutePath().normalize();
            if (Files.isRegularFile(codeLocation)) {
                return codeLocation.getParent();
            }

            for (Path candidate = codeLocation; candidate != null; candidate = candidate.getParent()) {
                if (Files.exists(candidate.resolve("build.gradle"))
                        || Files.exists(candidate.resolve("build.gradle.kts"))) {
                    return candidate;
                }
            }
        } catch (URISyntaxException exception) {
            throw new IllegalStateException("Could not resolve the server application directory", exception);
        }

        return Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cover image must be 2 MB or smaller");
        }

        String extension = switch (file.getContentType() == null ? "" : file.getContentType()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cover image must be JPG, PNG, or WEBP");
        };

        String fileName = UUID.randomUUID() + extension;
        Path target = uploadDirectory.resolve(fileName).normalize();
        if (!target.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid cover image name");
        }

        try (var inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        }
        logger.info("Stored book cover: {}", target);
        return URL_PREFIX + fileName;
    }

    public void delete(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith(URL_PREFIX)) {
            return;
        }

        Path image = uploadDirectory.resolve(imageUrl.substring(URL_PREFIX.length())).normalize();
        if (image.startsWith(uploadDirectory)) {
            try {
                Files.deleteIfExists(image);
            } catch (IOException ignored) {
            }
        }
    }

    public String resourceLocation() {
        return uploadDirectory.toUri().toString();
    }
}