package com.servicehub.dto;

import com.servicehub.entity.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
