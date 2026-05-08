package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.UserFollow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {
    boolean existsByFollowerIdAndFollowedId(Long followerId, Long followedId);
    UserFollow findByFollowerIdAndFollowedId(Long followerId, Long followedId);

    @Query("SELECT uf.followedId FROM UserFollow uf WHERE uf.followerId = :followerId ORDER BY uf.createTime DESC")
    Page<Long> findFollowedUserIdsByFollowerId(Long followerId, Pageable pageable);
}
