package com.bookgallery.server.controller;

import com.bookgallery.server.model.Book;
import com.bookgallery.server.model.PageResponse;
import com.bookgallery.server.service.BookService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class BooksController {

    private static final Logger logger = LoggerFactory.getLogger(BooksController.class);

    private final BookService bookService;

    public BooksController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/books")
    public ResponseEntity<PageResponse<Book>> getBooks(@RequestParam(required = false) String query, @RequestParam(required = false) List<String> categories, @RequestParam(defaultValue = "1") int pageNumber, @RequestParam(defaultValue = "12") int pageSize) {

        logger.info("Fetching books - query: {}, categories: {}, pageNumber: {}, pageSize: {}", query, categories, pageNumber, pageSize);

        if (pageNumber < 1) {
            logger.warn("Invalid pageNumber: {}. Using pageNumber: 1", pageNumber);
            pageNumber = 1;
        }

        if (pageSize <= 0) {
            logger.warn("Invalid pageSize: {}. Using pageSize: 12", pageSize);
            pageSize = 12;
        }

        List<Book> filteredBooks = bookService.getBooks(query, categories);

        int totalBookCount = filteredBooks.size();

        if (totalBookCount == 0) {
            logger.info("No books found for query: {} and categories: {}", query, categories);
            return ResponseEntity.ok(new PageResponse<>(List.of(), pageNumber, pageSize, 0));
        }

        int startIndex = (pageNumber - 1) * pageSize;

        if (startIndex >= totalBookCount) {
            logger.info("Page {} is beyond available books. Total books: {}", pageNumber, totalBookCount);
            return ResponseEntity.ok(new PageResponse<>(List.of(), pageNumber, pageSize, totalBookCount));
        }

        int endIndex = Math.min(startIndex + pageSize, totalBookCount);

        List<Book> booksForCurrentPage = filteredBooks.subList(startIndex, endIndex);

        PageResponse<Book> pageResponse = new PageResponse<>(booksForCurrentPage, pageNumber, pageSize, totalBookCount);

        logger.info("Books fetched successfully - pageNumber: {}, booksReturned: {}, totalBookCount: {}", pageNumber, booksForCurrentPage.size(), totalBookCount);

        return ResponseEntity.ok(pageResponse);
    }
}