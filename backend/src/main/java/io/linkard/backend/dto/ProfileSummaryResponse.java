package io.linkard.backend.dto;

import java.util.UUID;

public record ProfileSummaryResponse(
        UUID id,
        String username,
        String displayName,
        String bio,
        String avatarUrl,
        int servicesCount
) {}
