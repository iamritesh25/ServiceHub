package com.servicehub.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class CustomerDashboardDTO {
    private Long userId;
    private String userName;
    private String userEmail;
    private Integer totalBookings;
    private Integer completedServices;
    private Integer pendingServices;
    private Double averageRating;
    private List<ProviderProfileDTO> recentProviders;
    private List<ReviewDTO> myReviews;
}
