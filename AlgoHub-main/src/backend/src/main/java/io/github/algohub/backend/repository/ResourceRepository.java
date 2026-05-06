package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    Page<Resource> findByCategoryIdOrderBySortOrderAsc(Long categoryId, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.title LIKE %:kw% OR r.description LIKE %:kw% ORDER BY r.sortOrder ASC")
    Page<Resource> searchByKeyword(@Param("kw") String keyword, Pageable pageable);
}
