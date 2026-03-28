package io.linkard.backend.repository;

import io.linkard.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByClerkId(String clerkId);
    boolean existsByClerkId(String clerkId);
}
