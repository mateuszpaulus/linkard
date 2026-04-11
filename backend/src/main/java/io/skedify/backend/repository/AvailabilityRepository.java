package io.skedify.backend.repository;

import io.skedify.backend.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AvailabilityRepository extends JpaRepository<Availability, UUID> {
    List<Availability> findByProfileIdOrderByDayOfWeekAsc(UUID profileId);
    void deleteByProfileId(UUID profileId);
}
