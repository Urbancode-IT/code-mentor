package com.devarena.backend.service;

import com.devarena.backend.dto.CommentRequest;
import com.devarena.backend.dto.CommentResponse;
import com.devarena.backend.exception.ResourceNotFoundException;
import com.devarena.backend.exception.UnauthorizedException;
import com.devarena.backend.model.Comment;
import com.devarena.backend.model.Role;
import com.devarena.backend.model.Solution;
import com.devarena.backend.model.User;
import com.devarena.backend.repository.CommentRepository;
import com.devarena.backend.repository.SolutionRepository;
import com.devarena.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final SolutionRepository solutionRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, SolutionRepository solutionRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.solutionRepository = solutionRepository;
        this.userRepository = userRepository;
    }

    public List<CommentResponse> getCommentsBySolution(Long solutionId) {
        return commentRepository.findBySolutionIdOrderByCreatedAtAsc(solutionId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CommentResponse addComment(Long solutionId, CommentRequest request, String username) {
        Solution solution = solutionRepository.findById(solutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Solution not found with id: " + solutionId));

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = new Comment();
        comment.setSolution(solution);
        comment.setAuthor(author);
        comment.setContent(request.getContent());

        comment = commentRepository.save(comment);
        return toResponse(comment);
    }

    @Transactional
    public void deleteComment(Long id, String username) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!comment.getAuthor().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getAuthor().getDisplayName(),
                comment.getAuthor().getId(),
                comment.getAuthor().getProfilePicUrl(),
                comment.getCreatedAt()
        );
    }
}
