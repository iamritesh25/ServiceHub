package com.servicehub.dto;

import lombok.Data;

@Data
public class CancellationRequest {
    private String reason;  // Required cancellation reason
}
