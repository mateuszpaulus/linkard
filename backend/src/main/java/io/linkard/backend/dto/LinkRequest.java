package io.linkard.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LinkRequest(
        @NotBlank String label,
        @NotBlank String url,
        String iconName
) {}
