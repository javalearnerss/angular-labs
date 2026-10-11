package com.bookgallery.server.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
public class PageResponse<T> {

    private List<T> books;
    private int pageNumber;
    private int pageSize;
    private long totalBooks;
    private int totalPages;

    public PageResponse(List<T> books, int pageNumber, int pageSize, long totalBooks) {
        this.books = books;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalBooks = totalBooks;
        this.totalPages = (int) Math.ceil((double) totalBooks / pageSize);
    }

}