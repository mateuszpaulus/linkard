package io.skedify.backend.dto;

import java.time.LocalTime;

public record AvailabilitySlot(
        int dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        boolean isActive
) {}
