package io.skedify.backend.service;

import io.skedify.backend.dto.ContactRequest;
import io.skedify.backend.entity.Profile;
import io.skedify.backend.entity.ProfileEvent;
import io.skedify.backend.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ContactService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final ProfileEventService profileEventService;

    public ContactService(ProfileRepository profileRepository, EmailService emailService,
                          ProfileEventService profileEventService) {
        this.profileRepository = profileRepository;
        this.emailService = emailService;
        this.profileEventService = profileEventService;
    }

    @Transactional
    public void sendContact(String username, ContactRequest request) {
        Profile profile = profileRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        String ownerEmail = profile.getUser().getEmail();
        if (ownerEmail == null || ownerEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(422), "Owner email not set");
        }

        String displayName = profile.getDisplayName() != null
                ? profile.getDisplayName()
                : profile.getUsername();

        emailService.sendContactEmail(
                ownerEmail,
                displayName,
                request.name(),
                request.email(),
                request.message()
        );
        profileEventService.record(profile, ProfileEvent.Type.CONTACT);
    }
}
