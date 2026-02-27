package com.servicehub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long providerId;
    private String providerName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
