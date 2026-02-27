package com.servicehub.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.servicehub.dto.AuthResponse;
import com.servicehub.dto.GoogleAuthRequest;
import com.servicehub.entity.User;
import com.servicehub.entity.UserRole;
import com.servicehub.repository.UserRepository;
import com.servicehub.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuthService {

    private final GoogleTokenVerifierService tokenVerifier;
    private final UserRepository userRepository;
    private final JwtService jwtService;          // FIX 1: was referenced as jwtUtil (undeclared field)

    /**
     * Handles Google OAuth login/registration flow:
     * 1. Verify token with Google
     * 2. Find or create user
     * 3. Issue JWT
     */
    @Transactional
    public AuthResponse handleGoogleAuth(GoogleAuthRequest request) {

        // 1. Verify ID token with Google
        Payload payload = tokenVerifier.verify(request.getIdToken());

        String email     = payload.getEmail();
        String googleSub = payload.getSubject();
        String name      = (String) payload.get("name");
        String picture   = (String) payload.get("picture");

        // 2. Check if user already exists (by googleId or email)
        // FIX 2: UserRepository only has findByGoogleId(); there is no findByOauthProviderAndOauthId()
        Optional<User> existingByOAuth = userRepository.findByGoogleId(googleSub);
        Optional<User> existingByEmail = userRepository.findByEmail(email);

        User user;
        boolean isNewUser = false;

        if (existingByOAuth.isPresent()) {
            // Known OAuth user — update picture in case it changed
            user = existingByOAuth.get();
            // FIX 3: field is profileImage, not profileImageUrl
            user.setProfileImage(picture);

        } else if (existingByEmail.isPresent()) {
            // User registered with email/password before — link OAuth
            user = existingByEmail.get();
            // FIX 4: fields are authProvider and googleId, not oauthProvider / oauthId
            user.setAuthProvider("google");
            user.setGoogleId(googleSub);
            user.setProfileImage(picture);

        } else {
            // Brand new user — auto-register
            isNewUser = true;

            // Determine role — default CUSTOMER if not provided or invalid
            // FIX 6: request.getRole() returns UserRole enum, not String.
            // Compare directly with the enum constant instead of equalsIgnoreCase().
            UserRole role = (request.getRole() == UserRole.PROVIDER)
                    ? UserRole.PROVIDER
                    : UserRole.CUSTOMER;

            // FIX 5: User has no @Builder — use setters instead
            user = new User();
            user.setName(name != null ? name : email.split("@")[0]);
            user.setEmail(email);
            user.setPassword(null);          // No password for OAuth users
            user.setAuthProvider("google");  // FIX 4: correct field name
            user.setGoogleId(googleSub);     // FIX 4: correct field name
            user.setProfileImage(picture);   // FIX 3: correct field name
            user.setRole(role);
        }

        user = userRepository.save(user);

        // 3. Generate JWT exactly as existing login flow does
        // FIX 1: use injected jwtService, not undeclared jwtUtil
        String token = jwtService.generateToken(user);

        log.info("Google OAuth login: user={}, new={}", email, isNewUser);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profileImageUrl(user.getProfileImage())   // FIX 3: read from profileImage field
                .newUser(isNewUser)
                .build();
    }
}