package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.PostReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostReportRepository extends JpaRepository<PostReport, Long> {
    Page<PostReport> findByStatusOrderByCreateTimeDesc(String status, Pageable pageable);
    Page<PostReport> findAllByOrderByCreateTimeDesc(Pageable pageable);
    void deleteByPostId(Long postId);
    void deleteByCommentId(Long commentId);
}
