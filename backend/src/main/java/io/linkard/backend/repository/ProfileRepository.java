package io.linkard.backend.repository;

import io.linkard.backend.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Optional<Profile> findByUsername(String username);
    Optional<Profile> findByUserClerkId(String clerkId);
    boolean existsByUsername(String username);
}
