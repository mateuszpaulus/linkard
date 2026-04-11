package io.skedify.backend.repository;

import io.skedify.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByProfileIdOrderByDateAscStartTimeAsc(UUID profileId);
    List<Booking> findByProfileIdAndDateAndStatusNot(UUID profileId, LocalDate date, Booking.Status status);
    long countByProfile_User_ClerkIdAndStatus(String clerkId, Booking.Status status);
}
