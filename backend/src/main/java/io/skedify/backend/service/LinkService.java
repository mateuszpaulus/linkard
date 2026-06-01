package io.skedify.backend.service;

import io.skedify.backend.dto.LinkRequest;
import io.skedify.backend.dto.LinkResponse;
import io.skedify.backend.entity.Link;
import io.skedify.backend.entity.Profile;
import io.skedify.backend.repository.LinkRepository;
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
public class LinkService {

    private static final int FREE_LIMIT = 3;

    private final ProfileRepository profileRepository;
    private final LinkRepository linkRepository;
    private final ProfileMapper mapper;

    public LinkService(ProfileRepository profileRepository,
                       LinkRepository linkRepository,
                       ProfileMapper mapper) {
        this.profileRepository = profileRepository;
        this.linkRepository = linkRepository;
        this.mapper = mapper;
    }

    public List<LinkResponse> getMyLinks(String clerkId) {
        return profileRepository.findByUserClerkId(clerkId)
                .map(p -> linkRepository.findByProfileIdOrderByDisplayOrderAsc(p.getId())
                        .stream().map(mapper::toLinkResponse).toList())
                .orElse(List.of());
    }

    @Transactional
    public LinkResponse addLink(String clerkId, LinkRequest request) {
        Profile profile = requireProfile(clerkId);
        long activeLinks = profile.getLinks().stream().filter(Link::isActive).count();
        OwnershipGuard.requireUnderFreeLimit(profile, activeLinks, FREE_LIMIT,
                "Free plan limit: 3 links. Upgrade to Pro.");

        Link link = new Link();
        link.setProfile(profile);
        link.setLabel(request.label());
        link.setUrl(request.url());
        link.setIconName(request.iconName());
        link.setDisplayOrder(profile.getLinks().size());

        return mapper.toLinkResponse(linkRepository.save(link));
    }

    @Transactional
    public LinkResponse updateLink(String clerkId, UUID linkId, LinkRequest request) {
        Link link = requireOwnedLink(clerkId, linkId);
        if (request.label() != null) link.setLabel(request.label());
        if (request.url() != null) link.setUrl(request.url());
        if (request.iconName() != null) link.setIconName(request.iconName());
        return mapper.toLinkResponse(linkRepository.save(link));
    }

    @Transactional
    public void deleteLink(String clerkId, UUID linkId) {
        linkRepository.delete(requireOwnedLink(clerkId, linkId));
    }

    @Transactional
    public List<LinkResponse> reorderLinks(String clerkId, List<UUID> ids) {
        Profile profile = requireProfile(clerkId);
        List<Link> owned = linkRepository.findByProfileIdOrderByDisplayOrderAsc(profile.getId());

        if (ids.size() != owned.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Reorder list must contain all owned links");
        }
        var ownedIds = owned.stream().map(Link::getId).collect(java.util.stream.Collectors.toSet());
        if (!ownedIds.containsAll(ids) || !new java.util.HashSet<>(ids).equals(ownedIds)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Reorder list must match owned links exactly");
        }

        var byId = owned.stream().collect(java.util.stream.Collectors.toMap(Link::getId, l -> l));
        for (int i = 0; i < ids.size(); i++) {
            byId.get(ids.get(i)).setDisplayOrder(i);
        }
        linkRepository.saveAll(owned);
        return linkRepository.findByProfileIdOrderByDisplayOrderAsc(profile.getId())
                .stream().map(mapper::toLinkResponse).toList();
    }

    private Profile requireProfile(String clerkId) {
        return profileRepository.findByUserClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
    }

    private Link requireOwnedLink(String clerkId, UUID linkId) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));
        OwnershipGuard.requireOwner(link.getProfile(), clerkId);
        return link;
    }
}
