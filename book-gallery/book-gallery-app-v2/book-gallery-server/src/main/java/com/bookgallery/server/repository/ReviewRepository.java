package com.bookgallery.server.repository;

import com.bookgallery.server.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    public List<Review> findByBookId(Long bookId);


    @Query("""
    SELECT COALESCE(AVG(r.rating), 0)
    FROM Review r
    WHERE r.book.id = :bookId
    """)
    Double findAverageRating(@Param("bookId") Long bookId);


    @Query("""
    SELECT COUNT(r)
    FROM Review r
    WHERE r.book.id = :bookId
    """)
    long countByBookId(@Param("bookId") Long bookId);
}
