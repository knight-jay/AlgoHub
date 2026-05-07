package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.PostFavorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostFavoriteRepository extends JpaRepository<PostFavorite, Long> {
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    PostFavorite findByPostIdAndUserId(Long postId, Long userId);
    @Query("SELECT f.postId FROM PostFavorite f WHERE f.userId = :userId ORDER BY f.createTime DESC")
    Page<Long> findPostIdsByUserId(@Param("userId") Long userId, Pageable pageable);
    void deleteByPostId(Long postId);
}
