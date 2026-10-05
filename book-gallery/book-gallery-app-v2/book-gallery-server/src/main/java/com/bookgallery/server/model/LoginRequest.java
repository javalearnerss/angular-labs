package com.bookgallery.server.model;

public record LoginRequest(
        String username,
        String password
) {
}
