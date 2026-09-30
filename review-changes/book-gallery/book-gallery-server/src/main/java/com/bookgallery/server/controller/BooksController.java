package com.bookgallery.server.controller;

import com.bookgallery.server.model.Book;
import com.bookgallery.server.model.BookRequest;
import com.bookgallery.server.model.PageResponse;
import com.bookgallery.server.service.BookService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api")
public class BooksController {

    private static final Logger logger = LoggerFactory.getLogger(BooksController.class);

    private final BookService bookService;

    public BooksController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/books")
    public ResponseEntity<PageResponse<Book>> getBooks(@RequestParam( required = false) String query, @RequestParam(required = false) List<String> categories, @RequestParam(defaultValue = "1") int pageNumber, @RequestParam(defaultValue = "12") int pageSize) {

       /* try {
            TimeUnit.SECONDS.sleep(5);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }*/

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

    @GetMapping("/admin/books/search")
    public ResponseEntity<PageResponse<Book>> searchAdminBooks(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") Long categoryId,
            @RequestParam(defaultValue = "All") String status,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "1") int pageNumber,
            @RequestParam(defaultValue = "15") int pageSize) {
        return ResponseEntity.ok(bookService.searchAdminBooks(
                query, categoryId, status, sortBy, pageNumber, pageSize));
    }

    @GetMapping("/books/{bookId}")
    public ResponseEntity<Book> getBookById(@PathVariable Long bookId){

        logger.info("Fetching book with ID: {}", bookId);
        Book book = bookService.getBookById(bookId);

        if (book == null) {
            logger.warn("Book not found with ID: {}", bookId);
            return ResponseEntity.notFound().build();
        }
        logger.info("Book fetched successfully with ID: {}", bookId);
        return ResponseEntity.ok(book);
    }

    @PostMapping(value = "/books", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Book> createBook(@RequestPart("book") BookRequest request,
                                           @RequestPart(value = "coverImage", required = false) MultipartFile coverImage)
            throws IOException {
        Book book = bookService.createBook(request, coverImage);
        return ResponseEntity.created(URI.create("/api/books/" + book.getId())).body(book);
    }

    @PutMapping(value = "/books/{bookId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Book> updateBook(@PathVariable Long bookId,
                                           @RequestPart("book") BookRequest request,
                                           @RequestPart(value = "coverImage", required = false) MultipartFile coverImage)
            throws IOException {
        return ResponseEntity.ok(bookService.updateBook(bookId, request, coverImage));
    }

    @GetMapping("/book/title")
    public ResponseEntity<Book> getBookByTitle(@RequestParam String title){

        logger.info("Fetching book with title: {}", title);
        Book book = bookService.getBookByTitle(title);

        logger.info("Book fetched successfully with title: {}", title);
        if (book == null) {
            logger.warn("Book not found with title: {}", title);
            return ResponseEntity.notFound().build();
        }
        logger.info("Book fetched successfully with title: {}", title);
        return ResponseEntity.ok(book);
    }
}
