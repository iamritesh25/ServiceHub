package com.servicehub.service;

import com.servicehub.dto.CustomerDashboardDTO;
import com.servicehub.dto.ProviderDashboardDTO;
import com.servicehub.entity.User;
import com.servicehub.entity.UserRole;
import com.servicehub.exception.ResourceNotFoundException;
import com.servicehub.repository.UserRepository;
import com.servicehub.repository.ReviewRepository;
import com.servicehub.repository.ProviderProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProviderProfileRepository providerProfileRepository;

    /**
     * Get Customer Dashboard
     */
    public CustomerDashboardDTO getCustomerDashboard(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getRole().equals(UserRole.CUSTOMER)) {
            throw new ResourceNotFoundException("User is not a customer");
        }

        CustomerDashboardDTO dashboard = new CustomerDashboardDTO();
        dashboard.setUserId(user.getId());
        dashboard.setUserName(user.getName());
        dashboard.setUserEmail(user.getEmail());
        
        // TODO: Implement actual booking statistics from database
        dashboard.setTotalBookings(0);
        dashboard.setCompletedServices(0);
        dashboard.setPendingServices(0);
        dashboard.setAverageRating(0.0);

        return dashboard;
    }

    /**
     * Get Provider/Owner Dashboard
     */
    public ProviderDashboardDTO getProviderDashboard(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getRole().equals(UserRole.PROVIDER)) {
            throw new ResourceNotFoundException("User is not a provider");
        }

        ProviderDashboardDTO dashboard = new ProviderDashboardDTO();
        dashboard.setUserId(user.getId());
        dashboard.setProviderName(user.getName());
        dashboard.setProviderEmail(user.getEmail());

        // Get provider profile details if exists
        if (user.getProviderProfile() != null) {
            dashboard.setProviderId(user.getProviderProfile().getId());
            dashboard.setServiceType(user.getProviderProfile().getServiceType().toString());
            dashboard.setAccountStatus("ACTIVE");
        }

        // TODO: Implement actual service statistics from database
        dashboard.setTotalServices(0);
        dashboard.setCompletedServices(0);
        dashboard.setActiveServices(0);
        dashboard.setAverageRating(0.0);
        dashboard.setTotalReviews(0);

        return dashboard;
    }
}
