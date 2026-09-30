package com.bookgallery.server.controller;

import com.bookgallery.server.model.Category;
import com.bookgallery.server.service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CategoriesController {

    private static final Logger logger = LoggerFactory.getLogger(CategoriesController.class);

    private final CategoryService categoryService;

    public CategoriesController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAll() {
        logger.info("Fetching all categories");
        List<Category> categories = categoryService.getAll();
        if (categories.isEmpty()) {
            logger.info("No categories found");
            return ResponseEntity.notFound().build();
        }
        logger.info("Found {} categories", categories.size());
        return ResponseEntity.ok(categories);
    }

}
