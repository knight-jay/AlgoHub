package io.github.algohub.backend.service;

import io.github.algohub.backend.common.PageResult;
import io.github.algohub.backend.entity.Algorithm;
import io.github.algohub.backend.entity.AlgorithmCategory;

import java.util.List;

public interface AlgorithmService {
    List<AlgorithmCategory> getCategoryTree();
    List<AlgorithmCategory> getSubCategories(Long parentId);
    Algorithm getAlgorithmDetail(Long id);
    PageResult<Algorithm> searchAlgorithms(String keyword, int page, int pageSize);
    PageResult<Algorithm> getAlgorithmsByCategory(Long categoryId, int page, int pageSize);
    PageResult<Algorithm> getAlgorithmsByDifficulty(String difficulty, int page, int pageSize);
    Algorithm saveAlgorithm(Algorithm algorithm);
    Algorithm updateAlgorithm(Long id, Algorithm algorithm);
    void deleteAlgorithm(Long id);
}
