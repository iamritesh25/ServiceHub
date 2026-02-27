package com.servicehub.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateCustomerProfileDTO {
    private String name;
    private String phone;
    private String location;
}
