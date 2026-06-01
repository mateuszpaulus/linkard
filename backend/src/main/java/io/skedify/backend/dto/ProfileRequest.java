package io.skedify.backend.dto;

import jakarta.validation.constraints.Pattern;

public record ProfileRequest(
        @Pattern(regexp = "^[a-z0-9_-]{3,30}$", message = "Username must be 3-30 chars: lowercase letters, digits, _ or -")
        String username,
        String displayName,
        String bio,
        String avatarUrl,
        String location,
        String websiteUrl,
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Theme color must be a hex like #3B82F6")
        String themeColor
) {}
