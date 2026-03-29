package io.linkard.backend.dto;

public record StatsResponse(
        Long viewCount,
        int servicesCount,
        int linksCount,
        String profileUrl
) {}
