package com.servicehub.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AdminAnalyticsDTO {
    private long totalUsers;
    private long totalProviders;
    private long totalCustomers;
    private long totalBookings;
    private double totalRevenue;
    private double commissionEarned;
    private double cancelRate;
    private String mostPopularService;
    private List<Map<String, Object>> revenueByMonth;
    private List<Map<String, Object>> bookingTrends;
}
