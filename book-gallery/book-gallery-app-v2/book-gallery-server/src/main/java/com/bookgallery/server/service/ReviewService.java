package com.bookgallery.server.service;

import com.bookgallery.server.model.Review;
import com.bookgallery.server.model.ReviewSummary;
import com.bookgallery.server.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    /**
     * Retrieves all reviews for the specified book.
     *
     * @param bookId the ID of the book
     * @return list of reviews for the book
     */
    public List<Review> getReviewForBookId(Long bookId) {
        return reviewRepository.findByBookId(bookId);
    }

    /**
     * Retrieves the average rating and review count for the specified book.
     *
     * @param bookId the ID of the book
     * @return review summary containing average rating and review count
     */
    public ReviewSummary getReviewSummary(Long bookId) {
        Double averageRating = reviewRepository.findAverageRating(bookId);
        long reviewCount = reviewRepository.countByBookId(bookId);

        return new ReviewSummary(
                averageRating != null ? averageRating : 0.0,
                reviewCount
        );
    }
}