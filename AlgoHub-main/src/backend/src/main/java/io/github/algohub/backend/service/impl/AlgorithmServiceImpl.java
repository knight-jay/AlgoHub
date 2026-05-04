package io.github.algohub.backend.service.impl;

import io.github.algohub.backend.entity.Algorithm;
import io.github.algohub.backend.entity.AlgorithmCategory;
import io.github.algohub.backend.repository.AlgorithmCategoryRepository;
import io.github.algohub.backend.repository.AlgorithmRepository;
import io.github.algohub.backend.service.AlgorithmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlgorithmServiceImpl implements AlgorithmService {

    @Autowired
    private AlgorithmCategoryRepository categoryRepo;

    @Autowired
    private AlgorithmRepository algorithmRepo;

    @Override
    public List<AlgorithmCategory> getCategoryTree() {
        List<AlgorithmCategory> roots = categoryRepo.findByParentIdIsNullOrderBySortOrderAsc();
        // JPA懒加载会自动填充children（通过parent关联）
        return roots;
    }

    @Override
    public List<AlgorithmCategory> getSubCategories(Long parentId) {
        return categoryRepo.findByParentIdOrderBySortOrderAsc(parentId);
    }

    @Override
    public Algorithm getAlgorithmDetail(Long id) {
        return algorithmRepo.findById(id).orElse(null);
    }

    @Override
    public List<Algorithm> searchAlgorithms(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return algorithmRepo.findAll();
        }
        String kw = keyword.trim();
        return algorithmRepo.searchByKeyword(kw);
    }

    @Override
    public List<Algorithm> getAlgorithmsByCategory(Long categoryId) {
        return algorithmRepo.findByCategoryIdOrderByCreateTimeAsc(categoryId);
    }

    @Override
    public List<Algorithm> getAlgorithmsByDifficulty(String difficulty) {
        return algorithmRepo.findByDifficulty(difficulty);
    }

    @Override
    public Algorithm saveAlgorithm(Algorithm algorithm) {
        algorithm.setCreateTime(LocalDateTime.now());
        algorithm.setUpdateTime(LocalDateTime.now());
        return algorithmRepo.save(algorithm);
    }

    @Override
    public Algorithm updateAlgorithm(Long id, Algorithm updated) {
        Algorithm algo = algorithmRepo.findById(id).orElse(null);
        if (algo == null) return null;
        if (updated.getTitle() != null) algo.setTitle(updated.getTitle());
        if (updated.getDescription() != null) algo.setDescription(updated.getDescription());
        if (updated.getUsageIntro() != null) algo.setUsageIntro(updated.getUsageIntro());
        if (updated.getCppTemplate() != null) algo.setCppTemplate(updated.getCppTemplate());
        if (updated.getCategoryId() != null) algo.setCategoryId(updated.getCategoryId());
        if (updated.getDifficulty() != null) algo.setDifficulty(updated.getDifficulty());
        if (updated.getTags() != null) algo.setTags(updated.getTags());
        algo.setUpdateTime(LocalDateTime.now());
        return algorithmRepo.save(algo);
    }

    @Override
    public void deleteAlgorithm(Long id) {
        algorithmRepo.deleteById(id);
    }
}
