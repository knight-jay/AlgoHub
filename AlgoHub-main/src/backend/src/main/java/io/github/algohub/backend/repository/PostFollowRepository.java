package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.PostFollow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostFollowRepository extends JpaRepository<PostFollow, Long> {
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    PostFollow findByPostIdAndUserId(Long postId, Long userId);
    void deleteByPostId(Long postId);
}
