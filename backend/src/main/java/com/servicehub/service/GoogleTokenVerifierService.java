package com.servicehub.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Verifies Google ID tokens using Google's public keys.
 * No client secret required — purely public-key verification.
 */
@Service
@Slf4j
public class GoogleTokenVerifierService {

    @Value("${google.client.id}")
    private String googleClientId;

    /**
     * Verifies the token and returns the payload if valid, or throws if invalid.
     *
     * @param idTokenString the raw Google ID token from the frontend
     * @return verified Payload containing user info
     */
    public Payload verify(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new RuntimeException("Invalid or expired Google ID token");
            }

            Payload payload = idToken.getPayload();

            // Only accept verified Gmail accounts
            if (!payload.getEmailVerified()) {
                throw new RuntimeException("Google account email is not verified");
            }

            return payload;

        } catch (RuntimeException e) {
            throw e; // re-throw our own exceptions
        } catch (Exception e) {
            log.error("Google token verification error", e);
            throw new RuntimeException("Google token verification failed: " + e.getMessage());
        }
    }
}
