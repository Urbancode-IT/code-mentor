package com.devarena.backend.service;

import com.devarena.backend.dto.LeaderboardEntry;
import com.devarena.backend.model.User;
import com.devarena.backend.repository.SolutionRepository;
import com.devarena.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class LeaderboardService {

    private final SolutionRepository solutionRepository;
    private final UserRepository userRepository;

    public LeaderboardService(SolutionRepository solutionRepository, UserRepository userRepository) {
        this.solutionRepository = solutionRepository;
        this.userRepository = userRepository;
    }

    public List<LeaderboardEntry> getWeeklyLeaderboard() {
        LocalDateTime startOfWeek = LocalDateTime.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

        List<Object[]> results = solutionRepository.findTopContributorsSince(startOfWeek);

        // Collect users who submitted this week, with their solution counts
        Map<Long, Long> solutionCounts = new LinkedHashMap<>();
        for (Object[] row : results) {
            solutionCounts.put((Long) row[0], (Long) row[1]);
        }

        // Build entries and sort by credits descending
        List<LeaderboardEntry> entries = new ArrayList<>();
        for (Map.Entry<Long, Long> e : solutionCounts.entrySet()) {
            User user = userRepository.findById(e.getKey()).orElse(null);
            if (user == null) continue;

            LeaderboardEntry entry = new LeaderboardEntry();
            entry.setUserId(user.getId());
            entry.setDisplayName(user.getDisplayName());
            entry.setProfilePicUrl(user.getProfilePicUrl());
            entry.setCredits(user.getCredits());
            entry.setSolutionCount(e.getValue());
            entries.add(entry);
        }

        entries.sort((a, b) -> Integer.compare(b.getCredits(), a.getCredits()));

        assignRanks(entries);

        return entries.size() > 20 ? entries.subList(0, 20) : entries;
    }

    public List<LeaderboardEntry> getAllTimeLeaderboard() {
        List<User> allUsers = new ArrayList<>(userRepository.findAll());
        allUsers.sort((a, b) -> Integer.compare(b.getCredits(), a.getCredits()));

        List<LeaderboardEntry> entries = new ArrayList<>();
        for (User user : allUsers) {
            if (user.getCredits() <= 0) continue;

            LeaderboardEntry entry = new LeaderboardEntry();
            entry.setUserId(user.getId());
            entry.setDisplayName(user.getDisplayName());
            entry.setProfilePicUrl(user.getProfilePicUrl());
            entry.setCredits(user.getCredits());
            entry.setSolutionCount(0);
            entries.add(entry);

            if (entries.size() >= 20) break;
        }

        assignRanks(entries);

        return entries;
    }

    private void assignRanks(List<LeaderboardEntry> entries) {
        int rank = 0;
        for (int i = 0; i < entries.size(); i++) {
            if (i == 0 || entries.get(i).getCredits() != entries.get(i - 1).getCredits()) {
                rank++;
            }
            entries.get(i).setRank(rank);
        }
    }
}
