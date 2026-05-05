package io.github.algohub.backend.service;

import io.github.algohub.backend.entity.Algorithm;
import io.github.algohub.backend.entity.AlgorithmCategory;

import java.util.List;

public interface AlgorithmService {
    List<AlgorithmCategory> getCategoryTree();
    List<AlgorithmCategory> getSubCategories(Long parentId);
    Algorithm getAlgorithmDetail(Long id);
    List<Algorithm> searchAlgorithms(String keyword);
    List<Algorithm> getAlgorithmsByCategory(Long categoryId);
    List<Algorithm> getAlgorithmsByDifficulty(String difficulty);
    Algorithm saveAlgorithm(Algorithm algorithm);
    Algorithm updateAlgorithm(Long id, Algorithm algorithm);
    void deleteAlgorithm(Long id);
}
