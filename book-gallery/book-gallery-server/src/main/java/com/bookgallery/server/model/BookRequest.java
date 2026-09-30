package com.bookgallery.server.model;

public record BookRequest(
        String title,
        String author,
        String isbn,
        Long categoryId,
        Double price,
        Integer stock,
        String description) {
}