package com.servicehub.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceDTO {
    private String name;
    private Double price;           // kept for backward compat
    private String description;

    // NEW: price range
    private Double minPrice;
    private Double maxPrice;
    private String priceType;       // FIXED | RANGE
}
