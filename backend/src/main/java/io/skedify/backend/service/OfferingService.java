package io.skedify.backend.service;

import io.skedify.backend.dto.ServiceRequest;
import io.skedify.backend.dto.ServiceResponse;
import io.skedify.backend.entity.Offering;
import io.skedify.backend.entity.Profile;
import io.skedify.backend.repository.OfferingRepository;
import io.skedify.backend.repository.ProfileRepository;
import io.skedify.backend.service.mapper.ProfileMapper;
import io.skedify.backend.service.support.OwnershipGuard;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class OfferingService {

    private static final int FREE_LIMIT = 3;

    private final ProfileRepository profileRepository;
    private final OfferingRepository offeringRepository;
    private final ProfileMapper mapper;

    public OfferingService(ProfileRepository profileRepository,
                           OfferingRepository offeringRepository,
                           ProfileMapper mapper) {
        this.profileRepository = profileRepository;
        this.offeringRepository = offeringRepository;
        this.mapper = mapper;
    }

    public List<ServiceResponse> getMyOfferings(String clerkId) {
        return profileRepository.findByUserClerkId(clerkId)
                .map(p -> offeringRepository.findByProfileIdOrderByDisplayOrderAsc(p.getId())
                        .stream().map(mapper::toServiceResponse).toList())
                .orElse(List.of());
    }

    @Transactional
    public ServiceResponse addOffering(String clerkId, ServiceRequest request) {
        Profile profile = requireProfile(clerkId);
        long activeCount = profile.getOfferings().stream().filter(Offering::isActive).count();
        OwnershipGuard.requireUnderFreeLimit(profile, activeCount, FREE_LIMIT,
                "Free plan limit: 3 services. Upgrade to Pro.");

        Offering offering = new Offering();
        offering.setProfile(profile);
        offering.setTitle(request.title());
        offering.setDescription(request.description());
        offering.setPrice(request.price());
        if (request.currency() != null) offering.setCurrency(request.currency());
        offering.setPriceLabel(request.priceLabel());
        offering.setDisplayOrder(profile.getOfferings().size());

        return mapper.toServiceResponse(offeringRepository.save(offering));
    }

    @Transactional
    public ServiceResponse updateOffering(String clerkId, UUID offeringId, ServiceRequest request) {
        Offering offering = requireOwnedOffering(clerkId, offeringId);
        if (request.title() != null) offering.setTitle(request.title());
        if (request.description() != null) offering.setDescription(request.description());
        if (request.price() != null) offering.setPrice(request.price());
        if (request.currency() != null) offering.setCurrency(request.currency());
        if (request.priceLabel() != null) offering.setPriceLabel(request.priceLabel());
        return mapper.toServiceResponse(offeringRepository.save(offering));
    }

    @Transactional
    public void deleteOffering(String clerkId, UUID offeringId) {
        offeringRepository.delete(requireOwnedOffering(clerkId, offeringId));
    }

    @Transactional
    public List<ServiceResponse> reorderOfferings(String clerkId, List<UUID> ids) {
        Profile profile = requireProfile(clerkId);
        List<Offering> owned = offeringRepository.findByProfileIdOrderByDisplayOrderAsc(profile.getId());

        if (ids.size() != owned.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Reorder list must contain all owned services");
        }
        var ownedIds = owned.stream().map(Offering::getId).collect(java.util.stream.Collectors.toSet());
        if (!ownedIds.containsAll(ids) || !new java.util.HashSet<>(ids).equals(ownedIds)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Reorder list must match owned services exactly");
        }

        var byId = owned.stream().collect(java.util.stream.Collectors.toMap(Offering::getId, o -> o));
        for (int i = 0; i < ids.size(); i++) {
            byId.get(ids.get(i)).setDisplayOrder(i);
        }
        offeringRepository.saveAll(owned);
        return offeringRepository.findByProfileIdOrderByDisplayOrderAsc(profile.getId())
                .stream().map(mapper::toServiceResponse).toList();
    }

    private Profile requireProfile(String clerkId) {
        return profileRepository.findByUserClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
    }

    private Offering requireOwnedOffering(String clerkId, UUID offeringId) {
        Offering offering = offeringRepository.findById(offeringId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
        OwnershipGuard.requireOwner(offering.getProfile(), clerkId);
        return offering;
    }
}
