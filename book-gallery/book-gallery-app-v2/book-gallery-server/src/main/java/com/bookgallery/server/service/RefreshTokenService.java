package com.bookgallery.server.service;

import com.bookgallery.server.model.RefreshToken;
import com.bookgallery.server.repository.RefreshTokenRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Service responsible for creating, validating, and revoking refresh tokens.
 *
 * <p>Refresh tokens are generated using a cryptographically secure random
 * generator and only their SHA-256 hashes are persisted in the database.</p>
 *
 * <p>The raw refresh token is returned to the client only when it is created.
 * The database never stores the raw token.</p>
 */
@Service
public class RefreshTokenService {

    /** Repository used to persist and retrieve refresh-token records. */
    private final RefreshTokenRepository repository;

    /** Cryptographically secure random generator used to create refresh tokens. */
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Creates the refresh-token service.
     *
     * @param repository repository used for refresh-token persistence
     */
    public RefreshTokenService(RefreshTokenRepository repository) {
        // Store the repository dependency for refresh-token operations.
        this.repository = repository;
    }

    /**
     * Creates a new refresh token for the specified user.
     *
     * <p>The generated token contains 64 cryptographically secure random bytes
     * and is Base64 URL encoded before being returned to the client.</p>
     *
     * @param username username associated with the refresh token
     * @return raw refresh token that is safe to return to the client
     */
    public String createRefreshToken(String username) {

        // Generate 64 cryptographically secure random bytes for the refresh token.
        byte[] bytes = new byte[64];

        // Fill the byte array with unpredictable random data.
        secureRandom.nextBytes(bytes);

        // Encode the random bytes as a URL-safe Base64 token without padding.
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        // Create a new refresh-token entity for database persistence.
        RefreshToken entity = new RefreshToken();

        // Store only the SHA-256 hash of the raw refresh token.
        entity.setTokenHash(hash(rawToken));

        // Associate the refresh token with the authenticated user.
        entity.setUsername(username);

        // Set the refresh token expiration to seven days from creation.
        entity.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));

        // Mark the newly created refresh token as active.
        entity.setRevoked(false);

        // Store the creation timestamp for auditing and lifecycle management.
        entity.setCreatedAt(Instant.now());

        // Persist the refresh-token record in the database.
        repository.save(entity);

        // Return the raw token because only the client needs the original value.
        return rawToken;
    }

    /**
     * Validates a refresh token.
     *
     * <p>The supplied raw token is hashed and compared against the persisted
     * hash. The token must exist, must not be revoked, and must not be expired.</p>
     *
     * @param rawToken raw refresh token supplied by the client
     * @return validated refresh-token entity
     * @throws BadCredentialsException if the token is invalid, revoked, or expired
     */
    public RefreshToken validate(String rawToken) {

        // Hash the supplied token so it can be compared with the stored hash.
        String hash = hash(rawToken);

        // Find the refresh-token record using its SHA-256 hash.
        RefreshToken token = repository.findByTokenHash(hash).orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        // Reject the token if it has already been revoked.
        if (token.isRevoked()) {
            throw new BadCredentialsException("Refresh token has been revoked");
        }

        // Reject the token if its expiration time has passed.
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadCredentialsException("Refresh token has expired");
        }

        // Return the validated refresh-token record to the caller.
        return token;
    }

    /**
     * Revokes a refresh token so it cannot be used again.
     *
     * @param rawToken raw refresh token supplied by the client
     */
    public void revoke(String rawToken) {

        // Hash the supplied token to locate the persisted refresh-token record.
        String hash = hash(rawToken);

        // Find the token and mark it as revoked when it exists.
        repository.findByTokenHash(hash).ifPresent(token -> {
            // Mark the refresh token as revoked.
            token.setRevoked(true);

            // Persist the revoked state in the database.
            repository.save(token);
        });
    }

    /**
     * Creates a SHA-256 hash of the supplied token.
     *
     * <p>The hash allows the application to validate refresh tokens without
     * storing the original sensitive token value in the database.</p>
     *
     * @param value value to hash
     * @return hexadecimal SHA-256 hash
     */
    private String hash(String value) {

        try {
            // Create the SHA-256 message digest used to hash the refresh token.
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            // Calculate the SHA-256 hash using UTF-8 encoding.
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));

            // Convert the binary hash into a hexadecimal string for database storage.
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            // Fail fast because SHA-256 is required by the application runtime.
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}