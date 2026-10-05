package com.bookgallery.server.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class JwtKeyProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtKeyProvider.class);

    private final String secretId;
    private final ObjectMapper objectMapper;
    private final SecretsManagerClient secretsManagerClient;
    private final AtomicReference<KeySet> activeKeys = new AtomicReference<>();

    public JwtKeyProvider(
            @Value("${jwt.secret-id:}") String secretId,
            @Value("${jwt.current-secret:}") String localCurrentSecret,
            @Value("${jwt.previous-secret:}") String localPreviousSecret,
            ObjectMapper objectMapper) {
        this.secretId = secretId == null ? "" : secretId.trim();
        this.objectMapper = objectMapper;
        this.secretsManagerClient = this.secretId.isEmpty()
                ? null
                : SecretsManagerClient.builder().build();

        if (this.secretId.isEmpty()) {
            activeKeys.set(createKeySet(localCurrentSecret, localPreviousSecret));
        } else {
            try {
                fetchAndApplySecret();
            } catch (SdkException | IllegalStateException e) {
                throw new IllegalStateException(
                        "Unable to load initial JWT keys from AWS Secrets Manager secret '" + this.secretId + "'", e);
            }
        }
    }

    public KeySet currentKeySet() {
        return activeKeys.get();
    }

    @Scheduled(fixedDelayString = "${jwt.secret.refresh-interval-ms:30000}")
    public void refreshFromSecretsManager() {
        if (secretsManagerClient == null) {
            return;
        }

        try {
            fetchAndApplySecret();
        } catch (SdkException | IllegalStateException e) {
            logger.error("Unable to refresh JWT keys from Secrets Manager secret '{}'; retaining the last valid key set",
                    secretId, e);
        }
    }

    private void fetchAndApplySecret() {
        String secretDocument = secretsManagerClient.getSecretValue(
                GetSecretValueRequest.builder().secretId(secretId).build()
        ).secretString();

        if (secretDocument == null || secretDocument.isBlank()) {
            throw new IllegalStateException("JWT secret in Secrets Manager must contain a JSON SecretString");
        }

        applySecretDocument(secretDocument);
    }

    void applySecretDocument(String secretDocument) {
        try {
            JsonNode document = objectMapper.readTree(secretDocument);
            if (!document.isObject()) {
                throw new IllegalStateException("JWT Secrets Manager value must be a JSON object");
            }

            JsonNode current = document.get("currentSecret");
            JsonNode previous = document.get("previousSecret");

            if (current == null || !current.isTextual() || current.asText().isBlank()) {
                throw new IllegalStateException("JWT Secrets Manager JSON must include a non-empty currentSecret");
            }
            if (previous != null && !previous.isNull() && !previous.isTextual()) {
                throw new IllegalStateException("JWT previousSecret must be a string or null");
            }

            updateKeys(createKeySet(current.asText(), previous == null || previous.isNull()
                    ? ""
                    : previous.asText()));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("JWT Secrets Manager value is not valid JSON", e);
        }
    }

    private void updateKeys(KeySet newKeys) {
        KeySet previousKeys = activeKeys.getAndSet(newKeys);
        if (previousKeys == null || !previousKeys.hasSameKeyMaterial(newKeys)) {
            logger.info("Loaded updated JWT signing and validation keys");
        }
    }

    private KeySet createKeySet(String currentSecret, String previousSecret) {
        SecretKey signingKey = toKey(currentSecret, "currentSecret");
        List<SecretKey> validationKeys = new ArrayList<>();
        validationKeys.add(signingKey);

        if (previousSecret != null && !previousSecret.isBlank()
                && !MessageDigest.isEqual(
                currentSecret.getBytes(StandardCharsets.UTF_8),
                previousSecret.getBytes(StandardCharsets.UTF_8))) {
            validationKeys.add(toKey(previousSecret, "previousSecret"));
        }

        return new KeySet(signingKey, List.copyOf(validationKeys));
    }

    private SecretKey toKey(String secret, String fieldName) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT " + fieldName + " must be configured");
        }

        try {
            return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("JWT " + fieldName + " must contain at least 32 UTF-8 bytes for HS256", e);
        }
    }

    @PreDestroy
    void close() {
        if (secretsManagerClient != null) {
            secretsManagerClient.close();
        }
    }

    public record KeySet(SecretKey signingKey, List<SecretKey> validationKeys) {
        private boolean hasSameKeyMaterial(KeySet other) {
            if (validationKeys.size() != other.validationKeys.size()
                    || !sameKey(signingKey, other.signingKey)) {
                return false;
            }
            for (int i = 0; i < validationKeys.size(); i++) {
                if (!sameKey(validationKeys.get(i), other.validationKeys.get(i))) {
                    return false;
                }
            }
            return true;
        }

        private static boolean sameKey(SecretKey first, SecretKey second) {
            return MessageDigest.isEqual(first.getEncoded(), second.getEncoded());
        }
    }
}
