package io.skedify.backend.config;

import io.skedify.backend.entity.*;
import io.skedify.backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Component
@org.springframework.context.annotation.Profile("local")
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final AvailabilityRepository availabilityRepository;

    public DataSeeder(UserRepository userRepository, ProfileRepository profileRepository,
                      AvailabilityRepository availabilityRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.availabilityRepository = availabilityRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedIfMissing(
            "demo_anna",       "demo_anna@skedify.io",
            "anna-kowalska",   "Anna Kowalska",
            "Full-stack developer & tech consultant. I help startups go from idea to product. 6 years of experience in React, Node.js and AWS.",
            "Warsaw, Poland",  "https://github.com",
            List.of(
                new SeedService("1h Strategy Session",  "We'll map out your technical roadmap, architecture, and go-to-market approach.", new BigDecimal("350"), "PLN", "/h"),
                new SeedService("Code Review",           "Thorough review of your codebase with actionable feedback and priority fixes.",   new BigDecimal("500"), "PLN", null),
                new SeedService("MVP Development",       "Full-stack MVP in 4 weeks. Fixed scope, fixed price.",                            new BigDecimal("8000"), "PLN", "/project")
            ),
            List.of(
                new SeedLink("LinkedIn", "https://linkedin.com",   "linkedin"),
                new SeedLink("GitHub",   "https://github.com",     "github"),
                new SeedLink("Twitter",  "https://twitter.com",    "twitter")
            )
        );

        seedIfMissing(
            "demo_marek",      "demo_marek@skedify.io",
            "marek-wisniewski", "Marek Wiśniewski",
            "UX/UI Designer & Brand Strategist. I create interfaces that people actually enjoy using. Figma, Webflow, Framer.",
            "Kraków, Poland",  "https://dribbble.com",
            List.of(
                new SeedService("UX Audit",           "Identify friction points in your product with a detailed UX heuristics report.",   new BigDecimal("1200"), "PLN", null),
                new SeedService("UI Design (Mobile)", "Full mobile app UI kit — screens, components, design system in Figma.",             new BigDecimal("4500"), "PLN", null),
                new SeedService("Landing Page Design","High-converting landing page design + Webflow build. Delivered in 5 business days.",new BigDecimal("2500"), "PLN", null)
            ),
            List.of(
                new SeedLink("Dribbble",  "https://dribbble.com",  "other"),
                new SeedLink("LinkedIn",  "https://linkedin.com",  "linkedin"),
                new SeedLink("Instagram", "https://instagram.com", "instagram")
            )
        );

        seedIfMissing(
            "demo_julia",      "demo_julia@skedify.io",
            "julia-nowak",     "Julia Nowak",
            "Business & startup coach. I help founders build systems that scale without burning out. 50+ companies coached.",
            "Remote",          null,
            List.of(
                new SeedService("Discovery Call (FREE)",  "30-min intro call to see if we're a good fit. No commitment.",        BigDecimal.ZERO,           "PLN", "free"),
                new SeedService("1:1 Coaching Session",  "90-minute deep-dive on your biggest challenge right now.",            new BigDecimal("600"),     "PLN", "/session"),
                new SeedService("3-Month Accelerator",   "Weekly sessions + async support + tools & templates. For founders.", new BigDecimal("5400"),    "PLN", null)
            ),
            List.of(
                new SeedLink("LinkedIn",  "https://linkedin.com",  "linkedin"),
                new SeedLink("YouTube",   "https://youtube.com",   "youtube")
            )
        );

        userRepository.findByClerkId("local_test_user").ifPresent(u -> {
            if (u.getSubscriptionStatus() != User.SubscriptionStatus.PRO) {
                u.setSubscriptionStatus(User.SubscriptionStatus.PRO);
                userRepository.save(u);
                log.info("DataSeeder: local_test_user upgraded to PRO");
            }
        });

        log.info("DataSeeder: demo profiles ready.");
    }

    private void seedIfMissing(
            String clerkId, String email,
            String username, String displayName, String bio,
            String location, String websiteUrl,
            List<SeedService> services,
            List<SeedLink> links) {

        if (profileRepository.findByUsername(username).isPresent()) return;

        User user = userRepository.findByClerkId(clerkId).orElseGet(() -> {
            User u = new User();
            u.setClerkId(clerkId);
            u.setEmail(email);
            u.setSubscriptionStatus(User.SubscriptionStatus.PRO);
            return userRepository.save(u);
        });

        Profile profile = new Profile();
        profile.setUser(user);
        profile.setUsername(username);
        profile.setDisplayName(displayName);
        profile.setBio(bio);
        profile.setLocation(location);
        profile.setWebsiteUrl(websiteUrl);
        profile.setViewCount(0L);

        int order = 0;
        for (SeedService s : services) {
            Service svc = new Service();
            svc.setProfile(profile);
            svc.setTitle(s.title());
            svc.setDescription(s.description());
            svc.setPrice(s.price());
            svc.setCurrency(s.currency());
            svc.setPriceLabel(s.priceLabel());
            svc.setDisplayOrder(order++);
            profile.getServices().add(svc);
        }

        order = 0;
        for (SeedLink l : links) {
            Link link = new Link();
            link.setProfile(profile);
            link.setLabel(l.label());
            link.setUrl(l.url());
            link.setIconName(l.iconName());
            link.setDisplayOrder(order++);
            profile.getLinks().add(link);
        }

        profileRepository.save(profile);

        for (int dow = 0; dow <= 4; dow++) {
            Availability avail = new Availability();
            avail.setProfile(profile);
            avail.setDayOfWeek(dow);
            avail.setStartTime(LocalTime.of(9, 0));
            avail.setEndTime(LocalTime.of(17, 0));
            avail.setActive(true);
            availabilityRepository.save(avail);
        }

        log.info("DataSeeder: created demo profile '{}'", username);
    }

    private record SeedService(String title, String description, BigDecimal price, String currency, String priceLabel) {}
    private record SeedLink(String label, String url, String iconName) {}
}
