package com.servicehub.controller;

import com.servicehub.entity.ProviderProfile;
import com.servicehub.entity.User;
import com.servicehub.repository.ProviderProfileRepository;
import com.servicehub.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;

    public LocationController(UserRepository userRepository,
                               ProviderProfileRepository providerProfileRepository) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
    }

    /**
     * Save the authenticated user's current latitude and longitude.
     * Works for both CUSTOMER and PROVIDER roles.
     * Called from frontend via browser Geolocation API result.
     */
    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> saveLocation(
            @RequestBody Map<String, Double> body,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Double lat = body.get("latitude");
        Double lng = body.get("longitude");

        // Save to user table
        user.setLatitude(lat);
        user.setLongitude(lng);
        userRepository.save(user);

        // If PROVIDER, also save to provider_profiles table
        if ("PROVIDER".equals(user.getRole().name())) {
            providerProfileRepository.findByUserId(user.getId()).ifPresent(pp -> {
                pp.setLatitude(lat);
                pp.setLongitude(lng);
                providerProfileRepository.save(pp);
            });
        }

        return ResponseEntity.ok(Map.of("status", "Location saved successfully"));
    }
}
