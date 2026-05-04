package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.Algorithm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AlgorithmRepository extends JpaRepository<Algorithm, Long> {

    List<Algorithm> findByCategoryIdOrderByCreateTimeAsc(Long categoryId);

    @Query("SELECT a FROM Algorithm a WHERE a.title LIKE %:kw% OR a.description LIKE %:kw% ORDER BY a.createTime DESC")
    List<Algorithm> searchByKeyword(@Param("kw") String keyword);

    List<Algorithm> findByDifficulty(String difficulty);

    List<Algorithm> findByTagsContaining(String tag);
}
