package com.bookgallery.server.controller;

import com.bookgallery.server.model.LoginRequest;
import com.bookgallery.server.model.LoginResponse;
import com.bookgallery.server.model.RefreshToken;
import com.bookgallery.server.model.RefreshTokenRequest;
import com.bookgallery.server.service.JwtService;
import com.bookgallery.server.service.RefreshTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller responsible for authentication-related operations.
 *
 * <p>Provides endpoints for user login, access-token refresh, and logout.</p>
 *
 * <p>The controller uses Spring Security for username/password authentication,
 * {@link JwtService} for generating short-lived JWT access tokens, and
 * {@link RefreshTokenService} for managing refresh-token lifecycle.</p>
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserDetailsService userDetailsService;

    /**
     * Creates the authentication controller.
     *
     * @param authenticationManager authenticates username/password credentials
     * @param jwtService            generates JWT access tokens
     * @param refreshTokenService   creates, validates, and revokes refresh tokens
     * @param userDetailsService    loads user security information
     */
    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            UserDetailsService userDetailsService) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Authenticates the user and generates an access token and refresh token.
     *
     * <p>The username and password are validated by the configured
     * {@link AuthenticationManager}. If authentication succeeds, a
     * short-lived JWT access token and a persistent refresh token are created.</p>
     *
     * @param request contains the username and password
     * @return access token and refresh token
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        // Authenticate the supplied username and password.
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        // Generate a short-lived JWT access token for the authenticated user.
        String accessToken = jwtService.generateAccessToken(authentication);

        // Generate a persistent refresh token associated with the authenticated user.
        String refreshToken = refreshTokenService.createRefreshToken(authentication.getName());

        // Return both tokens to the client.
        return ResponseEntity.ok(new LoginResponse(accessToken, refreshToken, "Bearer", 900));
    }

    /**
     * Generates a new access token using a valid refresh token.
     *
     * <p>The refresh token is validated first. If valid, the associated user
     * is loaded and a new access token is generated. The old refresh token is
     * then revoked and replaced with a new refresh token.</p>
     *
     * <p>This refresh-token rotation prevents the same refresh token from
     * being reused after a successful refresh operation.</p>
     *
     * @param request contains the refresh token
     * @return newly generated access token and refresh token
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody RefreshTokenRequest request) {

        // Validate the supplied refresh token.
        RefreshToken oldRefreshToken = refreshTokenService.validate(request.refreshToken());

        // Load the current user associated with the refresh token.
        UserDetails user = userDetailsService.loadUserByUsername(oldRefreshToken.getUsername());

        // Create an authenticated principal using the current user and authorities.
        Authentication authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

        // Generate a new short-lived access token.
        String accessToken = jwtService.generateAccessToken(authentication);

        // Revoke the old refresh token as part of refresh-token rotation.
        refreshTokenService.revoke(request.refreshToken());

        // Generate a replacement refresh token for the user.
        String newRefreshToken = refreshTokenService.createRefreshToken(user.getUsername());

        // Return the new access token and new refresh token.
        return ResponseEntity.ok(new LoginResponse(accessToken, newRefreshToken, "Bearer", 900));
    }

    /**
     * Logs the user out by revoking the supplied refresh token.
     *
     * <p>The access token is short-lived and is not stored server-side.
     * Revoking the refresh token prevents the client from obtaining a new
     * access token after logout.</p>
     *
     * @param request contains the refresh token to revoke
     * @return HTTP 204 No Content
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshTokenRequest request) {

        // Revoke the refresh token so it cannot be used again.
        refreshTokenService.revoke(request.refreshToken());

        return ResponseEntity.noContent().build();
    }
}
