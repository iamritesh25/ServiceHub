package com.servicehub.controller;

import com.servicehub.dto.*;
import com.servicehub.entity.PaymentTransaction;
import com.servicehub.entity.UserRole;
import com.servicehub.exception.ResourceNotFoundException;
import com.servicehub.repository.UserRepository;
import com.servicehub.security.JwtService;
import com.servicehub.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.servicehub.entity.User;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    // ── Admin Login ──────────────────────────────────────────

    /**
     * POST /api/admin/login
     * Admin-only login — validates role=ADMIN in DB.
     * Not accessible via public /api/auth/register.
     */
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody AdminLoginDTO dto) {
        try {
            User admin = userRepository.findByEmail(dto.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid credentials"));

            if (admin.getRole() != UserRole.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied: not an admin account"));
            }

            if (!passwordEncoder.matches(dto.getPassword(), admin.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }

            String token = jwtService.generateToken(admin);
            return ResponseEntity.ok(Map.of(
                "token", token,
                "id", admin.getId(),
                "name", admin.getName(),
                "email", admin.getEmail(),
                "role", admin.getRole().name()
            ));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication failed"));
        }
    }

    // ── User Management ──────────────────────────────────────

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getAllUsers(role, search));
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @GetMapping("/users/{id}/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminBookingDTO>> getBookingsByUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getBookingsByUser(id));
    }

    @PutMapping("/users/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> suspendUser(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.suspendUser(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.activateUser(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Booking Management ────────────────────────────────────

    @GetMapping("/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminBookingDTO>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String providerEmail,
            @RequestParam(required = false) String customerEmail) {
        return ResponseEntity.ok(adminService.getAllBookings(status, providerEmail, customerEmail));
    }

    @PutMapping("/bookings/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> forceCancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = body != null ? body.get("reason") : null;
            return ResponseEntity.ok(adminService.forceCancelBooking(id, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/bookings/{id}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> markBookingCompleted(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.markBookingCompleted(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentTransaction>> getAllTransactions() {
        return ResponseEntity.ok(adminService.getAllTransactions());
    }

    @PostMapping("/transactions/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> mockRefund(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.mockRefund(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Analytics ────────────────────────────────────────────

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminAnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    // ── System Config ─────────────────────────────────────────

    @GetMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getSystemConfig() {
        return ResponseEntity.ok(adminService.getSystemConfig());
    }

    @PutMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateSystemConfig(@RequestBody Map<String, String> updates) {
        return ResponseEntity.ok(adminService.updateSystemConfig(updates));
    }

    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getSystemLogs() {
        return ResponseEntity.ok(adminService.getSystemLogs());
    }
}
