package com.bookgallery.server.service;

import com.bookgallery.server.model.Book;
import com.bookgallery.server.model.BookRequest;
import com.bookgallery.server.model.Category;
import com.bookgallery.server.model.PageResponse;
import com.bookgallery.server.repository.BookRepository;
import com.bookgallery.server.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookService {

    private static final String DEFAULT_COVER = "/images/books/no-preview.jpg";

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final BookImageStorageService imageStorageService;

    public BookService(BookRepository bookRepository, CategoryRepository categoryRepository,
                       BookImageStorageService imageStorageService) {
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
        this.imageStorageService = imageStorageService;
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }


    public List<Book> getBooks(String query, List<String> categories) {
        List<Category> allCategories = categoryRepository.findAll();
        List<String> selectedCategories = categories == null ? List.of()
                : categories.stream().map(String::trim).filter(name -> !name.isBlank()).toList();
        List<Book> books;
        if (selectedCategories.isEmpty()) {
            books = getAllBooks();
        } else {
            Set<Long> categoryIds = selectedCategories.stream().map(name -> allCategories.stream().filter(category -> category.getName().equalsIgnoreCase(name)).findFirst().map(Category::getId).orElse(null)).filter(Objects::nonNull).collect(Collectors.toSet());
            books = getAllBooks().stream().filter(book -> categoryIds.contains(book.getCategoryId())).toList();
        }
        if (query == null || query.isBlank()) {
            return books;
        }
        String searchText = query.trim().toLowerCase();
        return books.stream().filter(book -> book.getTitle().toLowerCase().contains(searchText) || book.getAuthor().toLowerCase().contains(searchText)).toList();
    }

    public PageResponse<Book> searchAdminBooks(String query, Long categoryId, String status,
                                               String sortBy, int pageNumber, int pageSize) {
        int safePageNumber = Math.max(pageNumber, 1);
        int safePageSize = pageSize <= 0 ? 15 : Math.min(pageSize, 100);
        String searchText = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        String normalizedStatus = status == null ? "all" : status.trim().toLowerCase(Locale.ROOT);

        List<Book> filteredBooks = getAllBooks().stream()
                .filter(book -> searchText.isEmpty()
                        || book.getTitle().toLowerCase(Locale.ROOT).contains(searchText)
                        || book.getAuthor().toLowerCase(Locale.ROOT).contains(searchText)
                        || book.getIsbn() != null && book.getIsbn().toLowerCase(Locale.ROOT).contains(searchText))
                .filter(book -> categoryId == null || categoryId <= 0 || categoryId.equals(book.getCategoryId()))
                .filter(book -> switch (normalizedStatus) {
                    case "all" -> true;
                    case "active" -> book.getStock() > 0;
                    case "out-of-stock", "out_of_stock" -> book.getStock() <= 0;
                    default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported book status");
                })
                .sorted(adminBookComparator(sortBy))
                .toList();

        int startIndex = Math.min((safePageNumber - 1) * safePageSize, filteredBooks.size());
        int endIndex = Math.min(startIndex + safePageSize, filteredBooks.size());
        return new PageResponse<>(filteredBooks.subList(startIndex, endIndex), safePageNumber,
                safePageSize, filteredBooks.size());
    }

    private Comparator<Book> adminBookComparator(String sortBy) {
        String normalizedSort = sortBy == null ? "newest" : sortBy.trim().toLowerCase(Locale.ROOT);
        return switch (normalizedSort) {
            case "oldest" -> Comparator.comparing(Book::getId);
            case "price-low" -> Comparator.comparingDouble(Book::getPrice);
            case "price-high" -> Comparator.comparingDouble(Book::getPrice).reversed();
            case "name" -> Comparator.comparing(Book::getTitle, String.CASE_INSENSITIVE_ORDER);
            case "newest", "" -> Comparator.comparing(Book::getId).reversed();
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sort order");
        };
    }

    public Book getBookById(Long bookId) {
        return bookRepository.findById(bookId).orElse(null);
    }

    public Book getBookByTitle(String title) {
        return bookRepository.findByTitle(title);
    }

    @Transactional
    public Book createBook(BookRequest request, MultipartFile coverImage) throws IOException {
        validateBook(request, null);
        Book book = newBook(request);
        String storedImage = imageStorageService.store(coverImage);
        book.setCoverImage(storedImage == null ? DEFAULT_COVER : storedImage);

        try {
            return bookRepository.save(book);
        } catch (RuntimeException exception) {
            imageStorageService.delete(storedImage);
            throw exception;
        }
    }

    @Transactional
    public Book updateBook(Long bookId, BookRequest request, MultipartFile coverImage) throws IOException {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
        validateBook(request, bookId);

        String previousImage = book.getCoverImage();
        String storedImage = imageStorageService.store(coverImage);
        book.setTitle(request.title().trim());
        book.setAuthor(request.author().trim());
        book.setIsbn(normalizeIsbn(request.isbn()));
        book.setCategoryId(request.categoryId());
        book.setPrice(request.price());
        book.setStock(request.stock());
        book.setDescription(normalizeDescription(request.description()));
        if (storedImage != null) {
            book.setCoverImage(storedImage);
        }

        try {
            Book savedBook = bookRepository.save(book);
            if (storedImage != null) {
                imageStorageService.delete(previousImage);
            }
            return savedBook;
        } catch (RuntimeException exception) {
            imageStorageService.delete(storedImage);
            throw exception;
        }
    }

    private Book newBook(BookRequest request) {
        Book book = new Book();
        book.setTitle(request.title().trim());
        book.setAuthor(request.author().trim());
        book.setIsbn(normalizeIsbn(request.isbn()));
        book.setCategoryId(request.categoryId());
        book.setPrice(request.price());
        book.setStock(request.stock());
        book.setDescription(normalizeDescription(request.description()));
        return book;
    }

    private void validateBook(BookRequest request, Long currentBookId) {
        if (request == null || request.title() == null || request.title().isBlank()
                || request.author() == null || request.author().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title and author are required");
        }
        if (request.categoryId() == null || !categoryRepository.existsById(request.categoryId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select a valid category");
        }
        if (request.price() == null || !Double.isFinite(request.price()) || request.price() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be greater than zero");
        }
        if (request.stock() == null || request.stock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock cannot be negative");
        }
        if (request.description() != null && request.description().length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description must be 500 characters or fewer");
        }

        String isbn = normalizeIsbn(request.isbn());
        if (isbn != null && !isValidIsbn(isbn)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid ISBN-10 or ISBN-13");
        }
        if (isbn != null) {
            bookRepository.findByIsbn(isbn).ifPresent(existing -> {
                if (!existing.getId().equals(currentBookId)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "ISBN is already in use");
                }
            });
        }

        String title = request.title().trim();
        bookRepository.findByTitleIgnoreCase(title).ifPresent(existing -> {
            if (!existing.getId().equals(currentBookId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A book with this title already exists");
            }
        });
    }

    private String normalizeIsbn(String isbn) {
        if (isbn == null || isbn.isBlank()) {
            return null;
        }
        return isbn.replaceAll("[-\\s]", "").toUpperCase(Locale.ROOT);
    }

    private String normalizeDescription(String description) {
        return description == null || description.isBlank() ? null : description.trim();
    }

    private boolean isValidIsbn(String isbn) {
        if (isbn.matches("\\d{9}[\\dX]")) {
            int sum = 0;
            for (int index = 0; index < isbn.length(); index++) {
                int digit = isbn.charAt(index) == 'X' ? 10 : Character.digit(isbn.charAt(index), 10);
                sum += digit * (10 - index);
            }
            return sum % 11 == 0;
        }
        if (isbn.matches("\\d{13}")) {
            int sum = 0;
            for (int index = 0; index < isbn.length(); index++) {
                int digit = Character.digit(isbn.charAt(index), 10);
                sum += digit * (index % 2 == 0 ? 1 : 3);
            }
            return sum % 10 == 0;
        }
        return false;
    }
}

