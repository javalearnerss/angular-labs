package com.bookgallery.server.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * Service responsible for generating JWT access tokens.
 *
 * <p>New tokens are signed with the current key. Tokens are validated against
 * both the current key and, when configured, a previous key.</p>
 *
 * <p>Each access token contains the authenticated username, token ID,
 * issued timestamp, expiration timestamp, and user authorities.</p>
 */
@Service
public class JwtService {

    private final JwtKeyProvider keyProvider;

    /**
     * Creates the JWT service with its runtime-refreshable key provider.
     *
     * @param keyProvider loads the active key set
     */
    public JwtService(JwtKeyProvider keyProvider) {
        this.keyProvider = keyProvider;
    }

    /**
     * Generates a short-lived JWT access token for the authenticated user.
     *
     * <p>The token is valid for 15 minutes and contains the user's
     * authorities in the {@code roles} claim.</p>
     *
     * @param authentication authenticated user information
     * @return signed JWT access token
     */
    public String generateAccessToken(Authentication authentication) {

        // Capture the current time so issued-at and expiration are calculated consistently.
        Instant now = Instant.now();

        // Build, sign, and return the JWT access token.
        JwtKeyProvider.KeySet keys = keyProvider.currentKeySet();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(authentication.getName())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(900)))
                .claim("roles", authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList())
                .signWith(keys.signingKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Verifies a signed access token using each configured validation key.
     *
     * @param token compact JWT from the Authorization header
     * @return claims from the verified token
     * @throws BadCredentialsException if no configured key can verify the token
     */
    public Claims validateAccessToken(String token) {
        RuntimeException lastFailure = null;
        List<SecretKey> validationKeys = keyProvider.currentKeySet().validationKeys();

        for (SecretKey key : validationKeys) {
            try {
                return Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
            } catch (JwtException | IllegalArgumentException e) {
                lastFailure = e;
            }
        }

        throw new BadCredentialsException("Invalid or expired access token", lastFailure);
    }

}