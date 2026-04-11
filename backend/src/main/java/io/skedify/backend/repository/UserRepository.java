package io.skedify.backend.repository;

import io.skedify.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByClerkId(String clerkId);
    boolean existsByClerkId(String clerkId);
    Optional<User> findByStripeSubscriptionId(String subscriptionId);
}
