package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.Algorithm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlgorithmRepository extends JpaRepository<Algorithm, Long> {

    Page<Algorithm> findByCategoryIdOrderByCreateTimeAsc(Long categoryId, Pageable pageable);

    @Query("SELECT a FROM Algorithm a WHERE a.title LIKE %:kw% OR a.description LIKE %:kw% ORDER BY a.createTime DESC")
    Page<Algorithm> searchByKeyword(@Param("kw") String keyword, Pageable pageable);

    Page<Algorithm> findByDifficulty(String difficulty, Pageable pageable);
}
