package com.devarena.backend.controller;

import com.devarena.backend.dto.LeaderboardEntry;
import com.devarena.backend.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<LeaderboardEntry>> getWeeklyLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getWeeklyLeaderboard());
    }

    @GetMapping("/alltime")
    public ResponseEntity<List<LeaderboardEntry>> getAllTimeLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getAllTimeLeaderboard());
    }
}
