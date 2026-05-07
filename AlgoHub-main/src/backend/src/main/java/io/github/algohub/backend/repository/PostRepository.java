package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findAllByOrderByCreateTimeDesc(Pageable pageable);

    Page<Post> findAllByOrderByLikeCountDescCreateTimeDesc(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.title LIKE %:kw% OR p.content LIKE %:kw% ORDER BY p.createTime DESC")
    Page<Post> searchByKeyword(@Param("kw") String keyword, Pageable pageable);

    Page<Post> findByUserIdOrderByCreateTimeDesc(Long userId, Pageable pageable);

    List<Post> findByUserId(Long userId);

    @Query("SELECT p FROM Post p WHERE p.id IN :ids ORDER BY p.createTime DESC")
    List<Post> findAllByIdIn(@Param("ids") List<Long> ids);

    @Modifying
    @Query("UPDATE Post p SET p.likeCount = p.likeCount + 1 WHERE p.id = :id")
    void incrementLikeCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Post p SET p.likeCount = p.likeCount - 1 WHERE p.id = :id AND p.likeCount > 0")
    void decrementLikeCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Post p SET p.commentCount = (SELECT COUNT(c) FROM Comment c WHERE c.postId = p.id) WHERE p.id = :id")
    void syncCommentCount(@Param("id") Long id);
}
