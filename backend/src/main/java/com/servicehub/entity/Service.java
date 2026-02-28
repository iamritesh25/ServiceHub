package com.servicehub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // Fixed price (kept for backward compat — null when price range is used)
    private Double price;

    // NEW: price range support
    @Column(name = "min_price")
    private Double minPrice;

    @Column(name = "max_price")
    private Double maxPrice;

    // FIXED | RANGE
    @Column(name = "price_type", length = 10)
    private String priceType = "FIXED";

    @Column(length = 1000)
    private String description;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    private User provider;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Convenience: display price string
    public String getPriceDisplay() {
        if ("RANGE".equals(priceType) && minPrice != null && maxPrice != null) {
            return "₹" + minPrice.intValue() + " – ₹" + maxPrice.intValue();
        }
        return price != null ? "₹" + price.intValue() : "₹0";
    }
}
