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

    private Double price;

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
}
