package com.servicehub.dto;

import com.servicehub.entity.Booking;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AdminBookingDTO {
    private Long id;
    private String serviceName;
    private Double servicePrice;
    private String customerName;
    private String customerEmail;
    private String providerName;
    private String providerEmail;
    private String status;
    private String paymentStatus;
    private String bookingLocation;
    private String cancellationReason;
    private String cancelledBy;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
    private BigDecimal paidAmount;

    public static AdminBookingDTO from(Booking b) {
        AdminBookingDTO dto = new AdminBookingDTO();
        dto.setId(b.getId());
        dto.setStatus(b.getStatus());
        dto.setPaymentStatus(b.getPaymentStatus());
        dto.setBookingLocation(b.getBookingLocation());
        dto.setCancellationReason(b.getCancellationReason());
        dto.setCancelledBy(b.getCancelledBy());
        dto.setCancelledAt(b.getCancelledAt());
        dto.setCreatedAt(b.getCreatedAt());
        if (b.getService() != null) {
            dto.setServiceName(b.getService().getName());
            dto.setServicePrice(b.getService().getPrice());
        }
        if (b.getCustomer() != null) {
            dto.setCustomerName(b.getCustomer().getName());
            dto.setCustomerEmail(b.getCustomer().getEmail());
        }
        if (b.getProvider() != null) {
            dto.setProviderName(b.getProvider().getName());
            dto.setProviderEmail(b.getProvider().getEmail());
        }
        return dto;
    }
}
