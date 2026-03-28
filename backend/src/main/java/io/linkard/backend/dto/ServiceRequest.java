package io.linkard.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ServiceRequest(
        @NotBlank String title,
        String description,
        @Positive BigDecimal price,
        String currency,
        String priceLabel
) {}
