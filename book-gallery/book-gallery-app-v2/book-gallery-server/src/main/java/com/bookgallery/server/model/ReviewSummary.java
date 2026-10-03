package com.bookgallery.server.model;

public class ReviewSummary {

    private final double averageRating;
    private final long reviewCount;

    public ReviewSummary(double averageRating, long reviewCount) {
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public long getReviewCount() {
        return reviewCount;
    }
}