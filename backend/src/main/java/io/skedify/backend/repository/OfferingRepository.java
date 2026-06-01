package io.skedify.backend.repository;

import io.skedify.backend.entity.Offering;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OfferingRepository extends JpaRepository<Offering, UUID> {
    List<Offering> findByProfileIdOrderByDisplayOrderAsc(UUID profileId);
}
