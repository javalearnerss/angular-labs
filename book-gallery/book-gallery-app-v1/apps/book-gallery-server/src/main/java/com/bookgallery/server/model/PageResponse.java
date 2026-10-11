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

    public PageResponse(List<T> content, int page, int size, long totalElements) {
        this.books = content;
        this.pageNumber = page;
        this.pageSize = size;
        this.totalBooks = totalElements;
        this.totalPages = (int) Math.ceil((double) totalElements / size);
    }

}