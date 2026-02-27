package com.servicehub.controller;

import com.servicehub.dto.*;
import com.servicehub.service.GoogleAuthService;
import com.servicehub.service.ProfileImageService;
import com.servicehub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private GoogleAuthService googleAuthService;

    @Autowired
    private ProfileImageService profileImageService;

    // ── Existing endpoints (unchanged) ────────────────────────

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@RequestBody UserRegistrationDTO dto) {
        UserResponseDTO response = userService.register(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(@RequestBody UserLoginDTO dto) {
        UserResponseDTO response = userService.login(dto);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        UserResponseDTO response = userService.getUserById(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ── NEW: Google OAuth ─────────────────────────────────────

    /**
     * POST /api/auth/google
     * Accepts Google ID token from frontend (via Google Sign-In SDK).
     * Verifies with Google servers, auto-registers if new user.
     * Returns JWT compatible with existing system.
     *
     * Body: { "idToken": "...", "role": "CUSTOMER" | "PROVIDER" (only for new users) }
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleAuthRequest req) {
        try {
            UserResponseDTO response = googleAuthService.authenticateWithGoogle(req);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── NEW: Profile Image Upload ──────────────────────────────

    /**
     * POST /api/auth/profile-image
     * Multipart upload. Accepts JPG, PNG, GIF, WEBP, SVG. Max 5MB.
     * Returns: { "imageUrl": "/uploads/profile-images/xxx.jpg" }
     */
    @PostMapping("/profile-image")
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Not authenticated. Please log in again."));
            }
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
            }
            String url = profileImageService.uploadProfileImage(file, authentication);
            return ResponseEntity.ok(Map.of("imageUrl", url));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }
}