package com.servicehub.service;

import com.servicehub.entity.User;
import com.servicehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class ProfileImageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif",
            "image/webp", "image/svg+xml"
    );

    @Value("${app.upload.dir:uploads/profile-images}")
    private String uploadDir;

    private final UserRepository userRepository;

    public ProfileImageService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String uploadProfileImage(MultipartFile file,
                                     Authentication authentication) throws IOException {

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported image format. Allowed: JPG, PNG, GIF, WEBP, SVG");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Image size must not exceed 5MB");
        }

        // Always resolve to an absolute path — required on Windows where
        // relative paths cause I/O failures
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }

        // Generate a unique filename
        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + ext;
        Path targetPath = dir.resolve(filename);

        // Write bytes directly — avoids Windows temp-file stream locking issues
        Files.write(targetPath, file.getBytes());

        // Build accessible URL path
        String imageUrl = "/uploads/profile-images/" + filename;

        // Update user record
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfileImage(imageUrl);
        userRepository.save(user);

        return imageUrl;
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : ".jpg";
    }
}