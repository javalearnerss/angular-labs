package com.bookgallery.server.controller;

import com.bookgallery.server.model.Author;
import com.bookgallery.server.service.AuthorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller responsible for handling author-related API requests.
 *
 * <p>This controller exposes endpoints for retrieving author information
 * and delegates business operations to {@link AuthorService}.</p>
 */
@RestController
@RequestMapping("/api/authors")
public class AuthorsController {

    private static final Logger logger = LoggerFactory.getLogger(AuthorsController.class);

    private final AuthorService authorService;

    /**
     * Creates an {@code AuthorsController} with the required author service.
     *
     * @param authorService service responsible for author-related operations
     */
    public AuthorsController(AuthorService authorService) {
        this.authorService = authorService;
    }

    /**
     * Retrieves all authors available in the system.
     *
     * <p>The request is delegated to {@link AuthorService} to retrieve
     * the authors. If no authors are available, the API returns HTTP 404.
     * Otherwise, the authors are returned with HTTP 200.</p>
     *
     * @return {@link ResponseEntity} containing the list of authors or
     *         HTTP 404 when no authors are found
     */
    @GetMapping("/all")
    public ResponseEntity<List<Author>> getAllAuthors() {

        logger.info("Received request to fetch all authors");

        List<Author> authors = authorService.allAuthors();

        if (authors.isEmpty()) {
            logger.info("No authors found");
            return ResponseEntity.notFound().build();
        }

        logger.info("Successfully retrieved {} authors", authors.size());

        return ResponseEntity.ok(authors);
    }
}