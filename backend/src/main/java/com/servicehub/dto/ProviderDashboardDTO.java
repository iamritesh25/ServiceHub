package com.servicehub.dto;

import java.util.List;

public class ProviderDashboardDTO {
    private Long providerId;
    private Long userId;
    private String providerName;
    private String providerEmail;
    private String businessName;
    private String serviceType;
    private Integer totalServices;
    private Integer completedServices;
    private Integer activeServices;
    private Double averageRating;
    private Integer totalReviews;
    private List<ReviewDTO> recentReviews;
    private String accountStatus; // ACTIVE, INACTIVE, SUSPENDED

    // Constructors
    public ProviderDashboardDTO() {}

    public ProviderDashboardDTO(Long providerId, Long userId, String providerName, 
                               String providerEmail, String businessName, String serviceType,
                               Integer totalServices, Integer completedServices, 
                               Integer activeServices, Double averageRating) {
        this.providerId = providerId;
        this.userId = userId;
        this.providerName = providerName;
        this.providerEmail = providerEmail;
        this.businessName = businessName;
        this.serviceType = serviceType;
        this.totalServices = totalServices;
        this.completedServices = completedServices;
        this.activeServices = activeServices;
        this.averageRating = averageRating;
    }

    // Getters & Setters
    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getProviderEmail() { return providerEmail; }
    public void setProviderEmail(String providerEmail) { this.providerEmail = providerEmail; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public Integer getTotalServices() { return totalServices; }
    public void setTotalServices(Integer totalServices) { this.totalServices = totalServices; }

    public Integer getCompletedServices() { return completedServices; }
    public void setCompletedServices(Integer completedServices) { this.completedServices = completedServices; }

    public Integer getActiveServices() { return activeServices; }
    public void setActiveServices(Integer activeServices) { this.activeServices = activeServices; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }

    public List<ReviewDTO> getRecentReviews() { return recentReviews; }
    public void setRecentReviews(List<ReviewDTO> recentReviews) { this.recentReviews = recentReviews; }

    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
}
