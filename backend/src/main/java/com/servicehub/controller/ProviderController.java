package com.servicehub.controller;

import com.servicehub.dto.CreateProviderProfileDTO;
import com.servicehub.dto.ProviderProfileDTO;
import com.servicehub.entity.ServiceType;
import com.servicehub.service.ProviderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@PreAuthorize("hasRole('PROVIDER')")
@RestController
@RequestMapping("/api/provider")
public class ProviderController {

    @Autowired
    private ProviderService providerService;

    // Create provider profile
    @PostMapping("/profile")
    public ResponseEntity<ProviderProfileDTO> createProviderProfile(
            @RequestParam Long userId,
            @RequestBody CreateProviderProfileDTO dto) {
        ProviderProfileDTO response = providerService.createProviderProfile(userId, dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
 // ✅ Update provider profile using logged-in user
    @PutMapping("/profile")
    public ResponseEntity<ProviderProfileDTO> updateMyProfile(
            @RequestBody CreateProviderProfileDTO dto,
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();

        ProviderProfileDTO response =
                providerService.updateProviderProfileByEmail(email, dto);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get provider profile by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProviderProfileDTO> getProviderProfileById(@PathVariable Long id) {
        ProviderProfileDTO response = providerService.getProviderProfileById(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get provider profile by User ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<ProviderProfileDTO> getProviderProfileByUserId(@PathVariable Long userId) {
        ProviderProfileDTO response = providerService.getProviderProfileByUserId(userId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Update provider profile
    @PutMapping("/{id}")
    public ResponseEntity<ProviderProfileDTO> updateProviderProfile(
            @PathVariable Long id,
            @RequestBody CreateProviderProfileDTO dto) {
        ProviderProfileDTO response = providerService.updateProviderProfile(id, dto);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Delete provider profile
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProviderProfile(@PathVariable Long id) {
        providerService.deleteProviderProfile(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Get all providers
    @GetMapping("/all")
    public ResponseEntity<List<ProviderProfileDTO>> getAllProviders() {
        List<ProviderProfileDTO> response = providerService.getAllProviders();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
