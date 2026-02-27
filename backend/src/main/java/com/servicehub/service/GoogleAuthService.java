package com.servicehub.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.servicehub.dto.GoogleAuthRequest;
import com.servicehub.dto.UserResponseDTO;
import com.servicehub.entity.User;
import com.servicehub.entity.UserRole;
import com.servicehub.repository.UserRepository;
import com.servicehub.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class GoogleAuthService {

    @Value("${google.client.id}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public GoogleAuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    /**
     * Verifies Google ID token, auto-registers on first login, and returns JWT.
     * Only valid Gmail accounts are accepted (email_verified must be true).
     */
    public UserResponseDTO authenticateWithGoogle(GoogleAuthRequest req) throws Exception {

        // 1. Verify the Google ID token with Google's servers
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(req.getIdToken());
        if (idToken == null) {
            throw new RuntimeException("Invalid Google ID token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();

        // 2. Only allow verified Gmail accounts
        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new RuntimeException("Google account email is not verified");
        }

        String email = payload.getEmail();
        if (!email.endsWith("@gmail.com")) {
            throw new RuntimeException("Only Gmail accounts are allowed");
        }

        String googleId = payload.getSubject();
        String name     = (String) payload.get("name");
        String picture  = (String) payload.get("picture");

        // 3. Find existing user by googleId or email
        Optional<User> existingByGoogleId = userRepository.findByGoogleId(googleId);
        Optional<User> existingByEmail    = userRepository.findByEmail(email);

        User user;

        if (existingByGoogleId.isPresent()) {
            // Returning Google user
            user = existingByGoogleId.get();
            user.setProfileImage(picture);   // refresh profile picture
            userRepository.save(user);

        } else if (existingByEmail.isPresent()) {
            // User registered with email/password — link Google account
            user = existingByEmail.get();
            user.setGoogleId(googleId);
            user.setProfileImage(picture);
            userRepository.save(user);

        } else {
            // First-time Google user — auto-register
            if (req.getRole() == null) {
                throw new RuntimeException("Role selection is required for first-time Google login");
            }

            user = new User();
            user.setName(name != null ? name : email.split("@")[0]);
            user.setEmail(email);
            user.setGoogleId(googleId);
            user.setProfileImage(picture);
            user.setRole(req.getRole());
            user.setAuthProvider("GOOGLE");
            user.setPassword(null);   // No password for Google-only account
            userRepository.save(user);
        }

        // 4. Generate JWT (same system as email/password login)
        String token = jwtService.generateToken(user);

        UserResponseDTO response = new UserResponseDTO(
                user.getId(), user.getName(), user.getEmail(),
                user.getPhone(), user.getRole(), user.getCreatedAt()
        );
        response.setToken(token);
        response.setProfileImage(user.getProfileImage());
        response.setAuthProvider(user.getAuthProvider());

        return response;
    }
}
