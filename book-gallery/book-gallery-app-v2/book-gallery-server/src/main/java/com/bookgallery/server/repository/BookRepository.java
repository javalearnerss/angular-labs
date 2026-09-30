package com.bookgallery.server.repository;

import com.bookgallery.server.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Book findByTitle(String title);

    Optional<Book> findByTitleIgnoreCase(String title);

    Optional<Book> findByIsbn(String isbn);

}
