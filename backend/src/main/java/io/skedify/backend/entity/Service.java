package io.skedify.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "services")
@Getter
@Setter
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @NotBlank
    private String title;

    @Column(length = 1000)
    private String description;

    @PositiveOrZero
    private BigDecimal price;

    private String currency = "PLN";

    private String priceLabel;

    private int displayOrder = 0;

    private boolean active = true;
}
