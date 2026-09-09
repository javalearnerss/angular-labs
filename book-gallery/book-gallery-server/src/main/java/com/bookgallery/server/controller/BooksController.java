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
    public ResponseEntity<PageResponse<Book>> getBooks(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "5") int pageSize) {

        logger.info("Fetching books - category: {}, pageNumber: {}, pageSize: {}",
                category, pageNumber, pageSize);

        if (pageNumber < 0) {
            logger.warn("Invalid pageNumber: {}. Using pageNumber: 0", pageNumber);
            pageNumber = 0;
        }

        if (pageSize <= 0) {
            logger.warn("Invalid pageSize: {}. Using pageSize: 5", pageSize);
            pageSize = 5;
        }

        List<Book> filteredBooks;

        if (category == null || category.isBlank() || category.startsWith("All")) {
            logger.debug("Fetching books from all categories");
            filteredBooks = bookService.getAllBooks();
        } else {
            logger.debug("Fetching books for category: {}", category);
            filteredBooks = bookService.getBooksByCategory(category);
        }

        if (filteredBooks.isEmpty()) {
            logger.info("No books found for category: {}", category);
            return ResponseEntity.notFound().build();
        }

        int totalBookCount = filteredBooks.size();

        int startIndex = (pageNumber-1) * pageSize;
        int endIndex = Math.min(startIndex + pageSize, totalBookCount);

        if (startIndex >= totalBookCount) {
            logger.info("Page {} is beyond available books. Total books: {}", pageNumber, totalBookCount);
            return ResponseEntity.ok(new PageResponse<>(List.of(), pageNumber, pageSize, totalBookCount));
        }

        List<Book> booksForCurrentPage = filteredBooks.subList(startIndex, endIndex);

        PageResponse<Book> pageResponse = new PageResponse<>(booksForCurrentPage, pageNumber, pageSize, totalBookCount);

        logger.info("Books fetched successfully - pageNumber: {}, booksReturned: {}, totalBookCount: {}",
                pageNumber, booksForCurrentPage.size(), totalBookCount);

        return ResponseEntity.ok(pageResponse);
    }
}