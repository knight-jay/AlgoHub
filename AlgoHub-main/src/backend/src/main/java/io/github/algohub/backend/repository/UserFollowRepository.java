package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {
    boolean existsByFollowerIdAndFollowedId(Long followerId, Long followedId);
    UserFollow findByFollowerIdAndFollowedId(Long followerId, Long followedId);
}
