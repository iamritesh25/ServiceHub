package com.servicehub.dto;

import lombok.Data;

@Data
public class SystemConfigDTO {
    private Double commissionPercent;
    private Boolean emailNotificationsEnabled;
    private Boolean maintenanceMode;
}
