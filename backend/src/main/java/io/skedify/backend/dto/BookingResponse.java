package io.skedify.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record BookingResponse(
        String id,
        String clientName,
        String clientEmail,
        String clientMessage,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String status,
        LocalDateTime createdAt
) {}
