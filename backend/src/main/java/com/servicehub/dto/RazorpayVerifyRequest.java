package com.servicehub.dto;

import lombok.Data;

@Data
public class RazorpayVerifyRequest {
    private Long bookingId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}
