package io.skedify.backend.service;

import io.skedify.backend.entity.Profile;
import io.skedify.backend.entity.ProfileEvent;
import io.skedify.backend.repository.ProfileEventRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class ProfileEventService {

    private final ProfileEventRepository repository;

    public ProfileEventService(ProfileEventRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void record(Profile profile, ProfileEvent.Type type) {
        try {
            ProfileEvent event = new ProfileEvent();
            event.setProfile(profile);
            event.setEventType(type);
            repository.save(event);
        } catch (Exception e) {
            // Never fail the main request because analytics failed.
            log.warn("Failed to record profile event {} for profile {}: {}",
                    type, profile.getId(), e.getMessage());
        }
    }
}
