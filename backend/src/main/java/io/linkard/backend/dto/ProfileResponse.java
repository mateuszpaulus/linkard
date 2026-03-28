package io.linkard.backend.dto;

import java.util.List;
import java.util.UUID;

public record ProfileResponse(
        UUID id,
        String username,
        String displayName,
        String bio,
        String avatarUrl,
        String location,
        String websiteUrl,
        List<ServiceResponse> services,
        List<LinkResponse> links
) {}
