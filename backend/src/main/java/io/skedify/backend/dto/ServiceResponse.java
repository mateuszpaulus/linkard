package io.skedify.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ServiceResponse(
        UUID id,
        String title,
        String description,
        BigDecimal price,
        String currency,
        String priceLabel,
        int displayOrder
) {}
