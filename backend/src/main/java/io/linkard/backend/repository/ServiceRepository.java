package io.linkard.backend.repository;

import io.linkard.backend.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceRepository extends JpaRepository<Service, UUID> {
    List<Service> findByProfileIdOrderByDisplayOrderAsc(UUID profileId);
}
