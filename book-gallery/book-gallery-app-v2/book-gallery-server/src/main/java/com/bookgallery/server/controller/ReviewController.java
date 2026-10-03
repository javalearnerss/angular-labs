package com.bookgallery.server.controller;

import com.bookgallery.server.model.ReviewSummary;
import com.bookgallery.server.service.ReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * Retrieves the review summary for the specified book.
     *
     * @param bookId the ID of the book
     * @return the average rating and total review count for the book
     */
    @GetMapping("/summary")
    public ResponseEntity<ReviewSummary> getReviewSummary(@RequestParam long bookId) {
        logger.info("Received request to fetch review summary for book ID: {}", bookId);

        ReviewSummary reviewSummary = reviewService.getReviewSummary(bookId);

        logger.info("Successfully retrieved review summary for book ID: {}", bookId);

        return ResponseEntity.ok(reviewSummary);
    }
}