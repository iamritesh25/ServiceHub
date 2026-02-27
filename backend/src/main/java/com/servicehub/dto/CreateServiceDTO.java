package com.servicehub.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceDTO {
    private String name;
    private Double price;
    private String description;
}
