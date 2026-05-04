package com.devarena.backend.controller;

import com.devarena.backend.dto.CourseOfferResponse;
import com.devarena.backend.exception.ResourceNotFoundException;
import com.devarena.backend.model.CourseOffer;
import com.devarena.backend.model.Role;
import com.devarena.backend.model.User;
import com.devarena.backend.repository.CourseOfferRepository;
import com.devarena.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offers")
public class CourseOfferController {

    private final CourseOfferRepository offerRepository;
    private final UserRepository userRepository;

    public CourseOfferController(CourseOfferRepository offerRepository, UserRepository userRepository) {
        this.offerRepository = offerRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<CourseOfferResponse>> getOffers(
            @AuthenticationPrincipal UserDetails userDetails) {
        int userCredits = 0;
        if (userDetails != null) {
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (user != null) userCredits = user.getCredits();
        }

        int credits = userCredits;
        List<CourseOfferResponse> offers = offerRepository.findByActiveTrueOrderByCreditsRequiredAsc()
                .stream()
                .map(o -> toResponse(o, credits))
                .toList();

        return ResponseEntity.ok(offers);
    }

    @PostMapping("/{id}/redeem")
    public ResponseEntity<?> redeemOffer(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.badRequest().body(Map.of("message", "Admins cannot redeem offers"));
        }

        CourseOffer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        if (user.getCredits() < offer.getCreditsRequired()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not enough credits"));
        }

        user.setCredits(user.getCredits() - offer.getCreditsRequired());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Offer redeemed successfully!",
                "remainingCredits", user.getCredits(),
                "offerLink", offer.getLink() != null ? offer.getLink() : ""
        ));
    }

    // Admin endpoint to create offers
    @PostMapping
    public ResponseEntity<CourseOfferResponse> createOffer(@RequestBody CourseOffer offer) {
        offer = offerRepository.save(offer);
        return ResponseEntity.ok(toResponse(offer, 0));
    }

    private CourseOfferResponse toResponse(CourseOffer o, int userCredits) {
        return new CourseOfferResponse(
                o.getId(), o.getTitle(), o.getDescription(),
                o.getCreditsRequired(), o.getImageUrl(), o.getLink(),
                userCredits >= o.getCreditsRequired()
        );
    }
}
