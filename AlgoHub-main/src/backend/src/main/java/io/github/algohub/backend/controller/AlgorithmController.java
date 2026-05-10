package io.github.algohub.backend.controller;

import io.github.algohub.backend.common.PageResult;
import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.entity.Algorithm;
import io.github.algohub.backend.entity.AlgorithmCategory;
import io.github.algohub.backend.service.AlgorithmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/algorithm")
public class AlgorithmController {

    @Autowired
    private AlgorithmService algorithmService;

    @GetMapping("/categories")
    public Result<List<AlgorithmCategory>> getCategoryTree() {
        return Result.success(algorithmService.getCategoryTree());
    }

    @GetMapping("/categories/{parentId}/children")
    public Result<List<AlgorithmCategory>> getSubCategories(@PathVariable Long parentId) {
        return Result.success(algorithmService.getSubCategories(parentId));
    }

    @GetMapping("/{id}")
    public Result<Algorithm> getDetail(@PathVariable Long id) {
        Algorithm algo = algorithmService.getAlgorithmDetail(id);
        if (algo == null) {
            return Result.error("算法不存在");
        }
        return Result.success(algo);
    }

    @GetMapping("/search")
    public Result<PageResult<Algorithm>> search(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return Result.success(algorithmService.searchAlgorithms(keyword.trim(), page, pageSize));
    }

    @GetMapping("/category/{categoryId}")
    public Result<PageResult<Algorithm>> getByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return Result.success(algorithmService.getAlgorithmsByCategory(categoryId, page, pageSize));
    }

    @GetMapping("/difficulty/{difficulty}")
    public Result<PageResult<Algorithm>> getByDifficulty(
            @PathVariable String difficulty,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return Result.success(algorithmService.getAlgorithmsByDifficulty(difficulty, page, pageSize));
    }
}
