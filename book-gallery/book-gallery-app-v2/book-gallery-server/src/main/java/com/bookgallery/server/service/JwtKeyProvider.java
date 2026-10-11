package com.bookgallery.server.service;

import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.ClassUtils;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtKeyProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtKeyProvider.class);
    private final KeySet keySet;

    public JwtKeyProvider(
            @Value("${jwt.current-secret:}") String currentSecret,
            @Value("${jwt.previous-secret:}") String previousSecret) {
        if ((currentSecret == null || currentSecret.isBlank()) && isDevelopmentRuntime()) {
            currentSecret = generateDevelopmentSecret();
            logger.warn("JWT_CURRENT_SECRET is not set; using a temporary development-only JWT key. "
                    + "Tokens will be invalidated when the application restarts.");
        }
        this.keySet = createKeySet(currentSecret, previousSecret);
    }

    public KeySet currentKeySet() {
        return keySet;
    }

    private KeySet createKeySet(String currentSecret, String previousSecret) {
        SecretKey signingKey = toKey(currentSecret, "currentSecret");
        List<SecretKey> validationKeys = new ArrayList<>();
        validationKeys.add(signingKey);

        if (previousSecret != null
                && !previousSecret.isBlank()
                && !MessageDigest.isEqual(
                currentSecret.getBytes(StandardCharsets.UTF_8),
                previousSecret.getBytes(StandardCharsets.UTF_8))) {
            validationKeys.add(toKey(previousSecret, "previousSecret"));
        }

        return new KeySet(signingKey, List.copyOf(validationKeys));
    }

    private boolean isDevelopmentRuntime() {
        return ClassUtils.isPresent(
                "org.springframework.boot.devtools.restart.Restarter",
                JwtKeyProvider.class.getClassLoader());
    }

    private String generateDevelopmentSecret() {
        byte[] secret = new byte[32];
        new SecureRandom().nextBytes(secret);
        return java.util.Base64.getEncoder().encodeToString(secret);
    }

    private SecretKey toKey(String secret, String fieldName) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT " + fieldName + " must be configured");
        }

        try {
            return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(
                    "JWT " + fieldName + " must contain at least 32 UTF-8 bytes for HS256",
                    e);
        }
    }

    public record KeySet(SecretKey signingKey, List<SecretKey> validationKeys) {
    }
}
