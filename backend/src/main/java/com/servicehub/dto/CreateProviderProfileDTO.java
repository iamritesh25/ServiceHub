package com.servicehub.dto;

import com.servicehub.entity.ServiceType;

public class CreateProviderProfileDTO {
    private ServiceType serviceType;
    private Integer experience;
    private String description;
    private String location;

    public CreateProviderProfileDTO() {}

    public CreateProviderProfileDTO(ServiceType serviceType, Integer experience, String description, String location) {
        this.serviceType = serviceType;
        this.experience = experience;
        this.description = description;
        this.location = location;
    }

    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }

    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
