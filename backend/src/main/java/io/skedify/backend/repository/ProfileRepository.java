package io.skedify.backend.repository;

import io.skedify.backend.entity.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Optional<Profile> findByUsername(String username);
    Optional<Profile> findByUserClerkId(String clerkId);
    boolean existsByUsername(String username);
    Page<Profile> findByDisplayNameIsNotNullOrderByCreatedAtDesc(Pageable pageable);

    @Query(value = """
        SELECT * FROM profiles
        WHERE display_name IS NOT NULL
          AND (CAST(:search AS text) IS NULL
               OR LOWER(display_name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(bio) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(username) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY created_at DESC
        """, countQuery = """
        SELECT COUNT(*) FROM profiles
        WHERE display_name IS NOT NULL
          AND (CAST(:search AS text) IS NULL
               OR LOWER(display_name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(bio) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(username) LIKE LOWER(CONCAT('%', :search, '%')))
        """, nativeQuery = true)
    Page<Profile> searchProfiles(@Param("search") String search, Pageable pageable);
}
