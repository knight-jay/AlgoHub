package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    PostLike findByPostIdAndUserId(Long postId, Long userId);
    List<PostLike> findByUserId(Long userId);
    void deleteByPostId(Long postId);
}
