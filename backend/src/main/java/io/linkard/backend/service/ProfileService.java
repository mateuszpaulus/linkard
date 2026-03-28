package io.linkard.backend.service;

import io.linkard.backend.dto.*;
import io.linkard.backend.entity.*;
import io.linkard.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final LinkRepository linkRepository;

    public ProfileResponse getPublicProfile(String username) {
        Profile profile = profileRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return toResponse(profile);
    }

    public ProfileResponse getMyProfile(String clerkId) {
        Profile profile = profileRepository.findByUserClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return toResponse(profile);
    }

    public List<ServiceResponse> getMyServices(String clerkId) {
        Profile profile = profileRepository.findByUserClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return serviceRepository.findByProfileIdOrderByDisplayOrderAsc(profile.getId())
                .stream().map(this::toServiceResponse).toList();
    }

    public List<LinkResponse> getMyLinks(String clerkId) {
        Profile profile = profileRepository.findByUserClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return linkRepository.findByProfileIdOrderByDisplayOrderAsc(profile.getId())
                .stream().map(this::toLinkResponse).toList();
    }

    @Transactional
    public ProfileResponse createOrUpdateProfile(String clerkId, String email, ProfileRequest request) {
        User user = userRepository.findByClerkId(clerkId).orElseGet(() -> {
            User newUser = new User();
            newUser.setClerkId(clerkId);
            newUser.setEmail(email);
            return userRepository.save(newUser);
        });

        Profile profile = profileRepository.findByUserClerkId(clerkId).orElseGet(() -> {
            Profile newProfile = new Profile();
            newProfile.setUser(user);
            return newProfile;
        });

        if (request.username() != null) {
            if (!request.username().equals(profile.getUsername()) && profileRepository.existsByUsername(request.username())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
            }
            profile.setUsername(request.username());
        }
        if (request.displayName() != null) profile.setDisplayName(request.displayName());
        if (request.bio() != null) profile.setBio(request.bio());
        if (request.avatarUrl() != null) profile.setAvatarUrl(request.avatarUrl());
        if (request.location() != null) profile.setLocation(request.location());
        if (request.websiteUrl() != null) profile.setWebsiteUrl(request.websiteUrl());

        return toResponse(profileRepository.save(profile));
    }

    @Transactional
    public ServiceResponse addService(String clerkId, ServiceRequest request) {
        Profile profile = profileRepository.findByUserClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        io.linkard.backend.entity.Service service = new io.linkard.backend.entity.Service();
        service.setProfile(profile);
        service.setTitle(request.title());
        service.setDescription(request.description());
        service.setPrice(request.price());
        if (request.currency() != null) service.setCurrency(request.currency());
        service.setPriceLabel(request.priceLabel());
        service.setDisplayOrder(profile.getServices().size());

        return toServiceResponse(serviceRepository.save(service));
    }

    @Transactional
    public void deleteService(String clerkId, UUID serviceId) {
        io.linkard.backend.entity.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
        if (!service.getProfile().getUser().getClerkId().equals(clerkId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        serviceRepository.delete(service);
    }

    @Transactional
    public LinkResponse addLink(String clerkId, LinkRequest request) {
        Profile profile = profileRepository.findByUserClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        Link link = new Link();
        link.setProfile(profile);
        link.setLabel(request.label());
        link.setUrl(request.url());
        link.setIconName(request.iconName());
        link.setDisplayOrder(profile.getLinks().size());

        return toLinkResponse(linkRepository.save(link));
    }

    @Transactional
    public void deleteLink(String clerkId, UUID linkId) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));
        if (!link.getProfile().getUser().getClerkId().equals(clerkId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        linkRepository.delete(link);
    }

    private ProfileResponse toResponse(Profile profile) {
        List<ServiceResponse> services = profile.getServices().stream()
                .filter(io.linkard.backend.entity.Service::isActive)
                .map(this::toServiceResponse)
                .toList();
        List<LinkResponse> links = profile.getLinks().stream()
                .filter(Link::isActive)
                .map(this::toLinkResponse)
                .toList();
        return new ProfileResponse(
                profile.getId(),
                profile.getUsername(),
                profile.getDisplayName(),
                profile.getBio(),
                profile.getAvatarUrl(),
                profile.getLocation(),
                profile.getWebsiteUrl(),
                services,
                links
        );
    }

    private ServiceResponse toServiceResponse(io.linkard.backend.entity.Service s) {
        return new ServiceResponse(s.getId(), s.getTitle(), s.getDescription(),
                s.getPrice(), s.getCurrency(), s.getPriceLabel(), s.getDisplayOrder());
    }

    private LinkResponse toLinkResponse(Link l) {
        return new LinkResponse(l.getId(), l.getLabel(), l.getUrl(), l.getIconName(), l.getDisplayOrder());
    }
}
