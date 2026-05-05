package io.github.algohub.backend.service.impl;

import io.github.algohub.backend.common.PageResult;
import io.github.algohub.backend.entity.Algorithm;
import io.github.algohub.backend.entity.AlgorithmCategory;
import io.github.algohub.backend.repository.AlgorithmCategoryRepository;
import io.github.algohub.backend.repository.AlgorithmRepository;
import io.github.algohub.backend.service.AlgorithmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlgorithmServiceImpl implements AlgorithmService {

    @Autowired
    private AlgorithmCategoryRepository categoryRepo;

    @Autowired
    private AlgorithmRepository algorithmRepo;

    @Override
    @Transactional(readOnly = true)
    public List<AlgorithmCategory> getCategoryTree() {
        List<AlgorithmCategory> roots = categoryRepo.findByParentIdIsNullOrderBySortOrderAsc();
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
    public PageResult<Algorithm> searchAlgorithms(String keyword, int page, int pageSize) {
        PageRequest pr = PageRequest.of(page - 1, pageSize);
        Page<Algorithm> result;
        if (keyword == null || keyword.trim().isEmpty()) {
            result = algorithmRepo.findAll(pr);
        } else {
            result = algorithmRepo.searchByKeyword(keyword.trim(), pr);
        }
        return new PageResult<>(result.getContent(), result.getTotalElements(), page, pageSize);
    }

    @Override
    public PageResult<Algorithm> getAlgorithmsByCategory(Long categoryId, int page, int pageSize) {
        PageRequest pr = PageRequest.of(page - 1, pageSize);
        Page<Algorithm> result = algorithmRepo.findByCategoryIdOrderByCreateTimeAsc(categoryId, pr);
        return new PageResult<>(result.getContent(), result.getTotalElements(), page, pageSize);
    }

    @Override
    public PageResult<Algorithm> getAlgorithmsByDifficulty(String difficulty, int page, int pageSize) {
        PageRequest pr = PageRequest.of(page - 1, pageSize);
        Page<Algorithm> result = algorithmRepo.findByDifficulty(difficulty, pr);
        return new PageResult<>(result.getContent(), result.getTotalElements(), page, pageSize);
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
