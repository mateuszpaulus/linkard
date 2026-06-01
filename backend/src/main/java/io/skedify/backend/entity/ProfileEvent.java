package io.skedify.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "profile_events",
        indexes = {
                @Index(name = "idx_profile_events_profile_type", columnList = "profile_id, eventType"),
                @Index(name = "idx_profile_events_created_at", columnList = "createdAt")
        }
)
@Getter
@Setter
public class ProfileEvent {

    public enum Type {
        VIEW,
        CONTACT,
        BOOK
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Type eventType;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
