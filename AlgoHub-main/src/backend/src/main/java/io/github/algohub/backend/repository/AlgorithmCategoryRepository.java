package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.AlgorithmCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlgorithmCategoryRepository extends JpaRepository<AlgorithmCategory, Long> {
    List<AlgorithmCategory> findByParentIdIsNullOrderBySortOrderAsc();
    List<AlgorithmCategory> findByParentIdOrderBySortOrderAsc(Long parentId);
}
