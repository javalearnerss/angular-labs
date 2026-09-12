package com.bookgallery.server.service;

import com.bookgallery.server.model.Book;
import com.bookgallery.server.model.Category;
import com.bookgallery.server.repository.BookRepository;
import com.bookgallery.server.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }


    public List<Book> getBooks(String query, List<String> categories) {
        List<Category> allCategories = categoryRepository.findAll();
        List<Book> books;
        if (categories == null || categories.isEmpty()) {
            books = getAllBooks();
        } else {
            Set<Long> categoryIds = categories.stream().map(String::trim).filter(name -> !name.isBlank()).map(name -> allCategories.stream().filter(category -> category.getName().equalsIgnoreCase(name)).findFirst().map(Category::getId).orElse(null)).filter(Objects::nonNull).collect(Collectors.toSet());
            books = getAllBooks().stream().filter(book -> categoryIds.contains(book.getCategoryId())).toList();
        }
        if (query == null || query.isBlank()) {
            return books;
        }
        String searchText = query.trim().toLowerCase();
        return books.stream().filter(book -> book.getTitle().toLowerCase().contains(searchText) || book.getAuthor().toLowerCase().contains(searchText)).toList();
    }
}

