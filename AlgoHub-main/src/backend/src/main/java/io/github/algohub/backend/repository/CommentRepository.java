package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    Page<Comment> findByPostIdOrderByCreateTimeAsc(Long postId, Pageable pageable);

    List<Comment> findByPostId(Long postId);

    int countByPostId(Long postId);

    List<Comment> findByUserId(Long userId);
}
