package com.bookgallery.server.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_hash",
            nullable = false,
            unique = true,
            length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private String username;

    @Column(name = "expires_at",
            nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked;

    @Column(name = "created_at",
            nullable = false)
    private Instant createdAt;

    // getters/setters
}