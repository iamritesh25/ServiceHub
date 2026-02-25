package com.servicehub.controller;

import com.servicehub.dto.CustomerDashboardDTO;
import com.servicehub.dto.ProviderDashboardDTO;
import com.servicehub.entity.User;
import com.servicehub.repository.UserRepository;
import com.servicehub.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get Customer Dashboard (Logged-in User)
     */
    @GetMapping("/customer")
    public ResponseEntity<CustomerDashboardDTO> getCustomerDashboard() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CustomerDashboardDTO dashboard =
                dashboardService.getCustomerDashboard(user.getId());

        return ResponseEntity.ok(dashboard);
    }

    /**
     * Get Provider Dashboard (Logged-in User)
     */
    @GetMapping("/provider")
    public ResponseEntity<ProviderDashboardDTO> getProviderDashboard() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProviderDashboardDTO dashboard =
                dashboardService.getProviderDashboard(user.getId());

        return ResponseEntity.ok(dashboard);
    }
}