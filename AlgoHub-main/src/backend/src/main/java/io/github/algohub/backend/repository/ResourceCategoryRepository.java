package io.github.algohub.backend.repository;

import io.github.algohub.backend.entity.ResourceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceCategoryRepository extends JpaRepository<ResourceCategory, Long> {
    List<ResourceCategory> findAllByOrderBySortOrderAsc();
}
