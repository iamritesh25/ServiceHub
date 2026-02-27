package com.servicehub.config;

/**
 * ─────────────────────────────────────────────────────────────
 *  SECURITY CONFIG — Phase 2 changes
 *  Merge into your existing SecurityConfig.java
 * ─────────────────────────────────────────────────────────────
 *
 * In your existing SecurityFilterChain bean, add this permit:
 *
 *   .requestMatchers("/api/auth/google").permitAll()
 *
 * Example final permitAll block:
 *
 *   .requestMatchers(
 *       "/api/auth/login",
 *       "/api/auth/register",
 *       "/api/auth/google",          // ← ADD THIS
 *       "/api/services/search",
 *       "/swagger-ui/**",
 *       "/v3/api-docs/**"
 *   ).permitAll()
 *
 * No other security changes needed — JWT filter and RBAC stay intact.
 * ─────────────────────────────────────────────────────────────
 */
public class SecurityConfigNotes {
    // Documentation class only — see comment above
}
