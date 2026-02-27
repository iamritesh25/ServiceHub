// ── CreateProviderProfileDTO.java ──
package com.servicehub.dto;

import com.servicehub.entity.ServiceType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProviderProfileDTO {
    private ServiceType serviceType;
    private Integer experience;
    private String description;
    private String location;
}
