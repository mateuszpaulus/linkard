package io.linkard.backend.repository;

import io.linkard.backend.entity.Link;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LinkRepository extends JpaRepository<Link, UUID> {
    List<Link> findByProfileIdOrderByDisplayOrderAsc(UUID profileId);
}
