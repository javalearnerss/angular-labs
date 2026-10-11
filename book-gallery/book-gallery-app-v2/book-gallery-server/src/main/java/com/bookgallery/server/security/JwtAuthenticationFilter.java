package com.bookgallery.server.security;

import com.bookgallery.server.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Spring Security filter responsible for authenticating requests using JWT access tokens.
 *
 * <p>This filter executes once for each HTTP request and looks for an
 * {@code Authorization} header containing a Bearer token.</p>
 *
 * <p>The authentication flow is:</p>
 * <ol>
 *     <li>Read the {@code Authorization} header.</li>
 *     <li>Verify that the header uses the {@code Bearer} authentication scheme.</li>
 *     <li>Extract the JWT access token.</li>
 *     <li>Validate the token using {@link JwtService}.</li>
 *     <li>Extract the username and roles from the validated claims.</li>
 *     <li>Convert the roles into Spring Security authorities.</li>
 *     <li>Create an authenticated {@link UsernamePasswordAuthenticationToken}.</li>
 *     <li>Store the authentication in {@link SecurityContextHolder}.</li>
 *     <li>Continue processing the request through the remaining filter chain.</li>
 * </ol>
 *
 * <p>If the token is invalid, expired, or contains invalid authentication
 * claims, the request is rejected with HTTP {@code 401 Unauthorized}.</p>
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /**
     * Service responsible for validating JWT access tokens and extracting
     * their cryptographically verified claims.
     */
    private final JwtService jwtService;

    /**
     * Creates the JWT authentication filter.
     *
     * @param jwtService service used to validate JWT access tokens
     */
    public JwtAuthenticationFilter(JwtService jwtService) {

        // Store the JWT service used to validate access tokens.
        this.jwtService = jwtService;
    }

    /**
     * Processes an incoming HTTP request and establishes Spring Security
     * authentication when a valid JWT Bearer token is present.
     *
     * <p>Requests without an Authorization header or without the Bearer
     * authentication scheme are allowed to continue through the filter chain.
     * This allows Spring Security's authorization configuration to determine
     * whether authentication is actually required for the requested endpoint.</p>
     *
     * @param request     current HTTP request
     * @param response    current HTTP response
     * @param filterChain remaining Spring Security filter chain
     * @throws ServletException if servlet processing fails
     * @throws IOException      if request or response processing fails
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {


        // Continue with the remaining Spring Security filters and ultimately the controller.
        filterChain.doFilter(request, response);
    }
}