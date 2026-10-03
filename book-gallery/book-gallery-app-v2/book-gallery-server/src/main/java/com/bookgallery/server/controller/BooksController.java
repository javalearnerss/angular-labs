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

    // Constructor injection for the BookService dependency.
    public BooksController(BookService bookService) {
        this.bookService = bookService;
    }

    // Fetch books with optional search, category filters, and pagination.
    @GetMapping("/books")
    public ResponseEntity<PageResponse<Book>> getBooks(@RequestParam(required = false) String query, @RequestParam(required = false) List<String> categories, @RequestParam(defaultValue = "1") int pageNumber, @RequestParam(defaultValue = "12") int pageSize) {

        // Log the search and pagination parameters for troubleshooting.
        logger.info("Fetching books - query: {}, categories: {}, pageNumber: {}, pageSize: {}", query, categories, pageNumber, pageSize);

        // Ensure the page number is always greater than or equal to 1.
        if (pageNumber < 1) {
            logger.warn("Invalid pageNumber: {}. Using pageNumber: 1", pageNumber);
            pageNumber = 1;
        }

        // Ensure the page size is a positive value.
        if (pageSize <= 0) {
            logger.warn("Invalid pageSize: {}. Using pageSize: 12", pageSize);
            pageSize = 12;
        }

        // Fetch books matching the search and category filters.
        List<Book> filteredBooks = bookService.getBooks(query, categories);

        // Get the total number of books after filtering.
        int totalBookCount = filteredBooks.size();

        // Return an empty page when no books match the filters.
        if (totalBookCount == 0) {
            logger.info("No books found for query: {} and categories: {}", query, categories);
            return ResponseEntity.ok(new PageResponse<>(List.of(), pageNumber, pageSize, 0));
        }

        // Calculate the starting index for the requested page.
        int startIndex = (pageNumber - 1) * pageSize;

        // Return an empty page when the requested page is beyond the available data.
        if (startIndex >= totalBookCount) {
            logger.info("Page {} is beyond available books. Total books: {}", pageNumber, totalBookCount);
            return ResponseEntity.ok(new PageResponse<>(List.of(), pageNumber, pageSize, totalBookCount));
        }

        // Calculate the ending index without exceeding the total number of books.
        int endIndex = Math.min(startIndex + pageSize, totalBookCount);

        // Extract the books belonging to the requested page.
        List<Book> booksForCurrentPage = filteredBooks.subList(startIndex, endIndex);

        // Create the paginated response.
        PageResponse<Book> pageResponse = new PageResponse<>(booksForCurrentPage, pageNumber, pageSize, totalBookCount);

        logger.info("Books fetched successfully - pageNumber: {}, booksReturned: {}, totalBookCount: {}", pageNumber, booksForCurrentPage.size(), totalBookCount);

        return ResponseEntity.ok(pageResponse);
    }

    // Search books from the admin interface with filtering, sorting, and pagination.
    @GetMapping("/admin/books/search")
    public ResponseEntity<PageResponse<Book>> searchAdminBooks(@RequestParam(required = false) String query, @RequestParam(defaultValue = "0") Long categoryId, @RequestParam(defaultValue = "All") String status, @RequestParam(defaultValue = "newest") String sortBy, @RequestParam(defaultValue = "1") int pageNumber, @RequestParam(defaultValue = "15") int pageSize) {
        return ResponseEntity.ok(bookService.searchAdminBooks(query, categoryId, status, sortBy, pageNumber, pageSize));
    }

    // Fetch a single book using its unique ID.
    @GetMapping("/books/{bookId}")
    public ResponseEntity<Book> getBookById(@PathVariable Long bookId) {

        logger.info("Fetching book with ID: {}", bookId);

        // Delegate the lookup to the service layer.
        Book book = bookService.getBookById(bookId);

        // Return HTTP 404 when the requested book does not exist.
        if (book == null) {
            logger.warn("Book not found with ID: {}", bookId);
            return ResponseEntity.notFound().build();
        }

        logger.info("Book fetched successfully with ID: {}", bookId);

        return ResponseEntity.ok(book);
    }

    // Create a new book with an optional cover image.
    @PostMapping(value = "/books", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Book> createBook(@RequestPart("book") BookRequest request, @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) throws IOException {

        // Delegate book creation and image processing to the service layer.
        Book book = bookService.createBook(request, coverImage);

        // Return HTTP 201 Created with the location of the newly created resource.
        return ResponseEntity.created(URI.create("/api/books/" + book.getId())).body(book);
    }

    // Update an existing book with an optional cover image.
    @PutMapping(value = "/books/{bookId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Book> updateBook(@PathVariable Long bookId, @RequestPart("book") BookRequest request, @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) throws IOException {

        // Delegate the update operation to the service layer.
        return ResponseEntity.ok(bookService.updateBook(bookId, request, coverImage));
    }

    // Fetch a book using its title.
    @GetMapping("/book/title")
    public ResponseEntity<Book> getBookByTitle(@RequestParam String title) {

        logger.info("Fetching book with title: {}", title);

        // Delegate the title-based lookup to the service layer.
        Book book = bookService.getBookByTitle(title);

        // Return HTTP 404 when no book matches the supplied title.
        if (book == null) {
            logger.warn("Book not found with title: {}", title);
            return ResponseEntity.notFound().build();
        }

        logger.info("Book fetched successfully with title: {}", title);

        return ResponseEntity.ok(book);
    }
}
