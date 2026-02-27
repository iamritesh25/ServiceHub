package com.servicehub.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class ProviderDashboardDTO {
    private Long providerId;
    private Long userId;
    private String providerName;
    private String providerEmail;
    private String serviceType;
    private Integer totalServices;
    private Integer completedServices;
    private Integer activeServices;
    private Double averageRating;
    private Integer totalReviews;
    private String accountStatus;
    private List<ReviewDTO> recentReviews;
}
