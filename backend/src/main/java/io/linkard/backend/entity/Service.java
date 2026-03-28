package io.linkard.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "services")
@Getter @Setter @NoArgsConstructor
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

    @Positive
    private BigDecimal price;

    private String currency = "PLN";

    private String priceLabel;

    private int displayOrder = 0;

    private boolean active = true;
}
