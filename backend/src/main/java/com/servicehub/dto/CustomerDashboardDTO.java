package com.servicehub.dto;

import java.util.List;

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

    // Constructors
    public CustomerDashboardDTO() {}

    public CustomerDashboardDTO(Long userId, String userName, String userEmail, 
                              Integer totalBookings, Integer completedServices, 
                              Integer pendingServices, Double averageRating) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.totalBookings = totalBookings;
        this.completedServices = completedServices;
        this.pendingServices = pendingServices;
        this.averageRating = averageRating;
    }

    // Getters & Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Integer getTotalBookings() { return totalBookings; }
    public void setTotalBookings(Integer totalBookings) { this.totalBookings = totalBookings; }

    public Integer getCompletedServices() { return completedServices; }
    public void setCompletedServices(Integer completedServices) { this.completedServices = completedServices; }

    public Integer getPendingServices() { return pendingServices; }
    public void setPendingServices(Integer pendingServices) { this.pendingServices = pendingServices; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public List<ProviderProfileDTO> getRecentProviders() { return recentProviders; }
    public void setRecentProviders(List<ProviderProfileDTO> recentProviders) { this.recentProviders = recentProviders; }

    public List<ReviewDTO> getMyReviews() { return myReviews; }
    public void setMyReviews(List<ReviewDTO> myReviews) { this.myReviews = myReviews; }
}
