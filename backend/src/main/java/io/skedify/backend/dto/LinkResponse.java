package io.skedify.backend.dto;

import java.util.UUID;

public record LinkResponse(
        UUID id,
        String label,
        String url,
        String iconName,
        int displayOrder
) {}
