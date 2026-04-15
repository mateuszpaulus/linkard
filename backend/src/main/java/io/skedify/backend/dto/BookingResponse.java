package io.skedify.backend.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        String clientName,
        String clientEmail,
        String clientMessage,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String status,
        Instant createdAt
) {}
