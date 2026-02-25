package com.servicehub.dto;

import com.servicehub.entity.ServiceType;

public class ProviderProfileDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String email;
    private String phone;
    private ServiceType serviceType;
    private Integer experience;
    private String description;
    private String location;
    private Double rating;

    public ProviderProfileDTO() {}

    public ProviderProfileDTO(Long id, Long userId, String userName, String email, String phone,
                             ServiceType serviceType, Integer experience, String description,
                             String location, Double rating) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.phone = phone;
        this.serviceType = serviceType;
        this.experience = experience;
        this.description = description;
        this.location = location;
        this.rating = rating;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }

    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
}
