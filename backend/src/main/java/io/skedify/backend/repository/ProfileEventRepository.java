package io.skedify.backend.repository;

import io.skedify.backend.entity.ProfileEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProfileEventRepository extends JpaRepository<ProfileEvent, UUID> {
    long countByProfileIdAndEventType(UUID profileId, ProfileEvent.Type eventType);
}
