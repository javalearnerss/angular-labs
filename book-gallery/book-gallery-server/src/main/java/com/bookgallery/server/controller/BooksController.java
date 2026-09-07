package com.bookgallery.server.controller;

import com.bookgallery.server.model.Book;
import com.bookgallery.server.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200") // Allow requests from the React frontend
public class BooksController {

    private final BookService bookService;

    public BooksController(BookService bookService) {
        this.bookService = bookService;
    }

    public void getBooks() {
        // Logic to retrieve books from the database or service
    }

    public void getBookById(Long id) {
        // Logic to retrieve a specific book by its ID
    }

    @GetMapping("books")
    public ResponseEntity<List<Book>> getBooksByCategory(
            @RequestParam(required = false) String category) {

        if (category == null || category.isBlank() || category.contains("All")) {
            return ResponseEntity.ok(bookService.getAllBooks());
        }


        List<Book> books = bookService.getBooksByCategory(category);

        if (books.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(books);
    }
}
