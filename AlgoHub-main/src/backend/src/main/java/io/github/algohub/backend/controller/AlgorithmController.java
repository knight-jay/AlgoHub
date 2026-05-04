package io.github.algohub.backend.controller;

import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.entity.Algorithm;
import io.github.algohub.backend.entity.AlgorithmCategory;
import io.github.algohub.backend.service.AlgorithmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public Result<Map<String, Object>> search(@RequestParam String keyword) {
        List<Algorithm> list = algorithmService.searchAlgorithms(keyword);
        Map<String, Object> data = new HashMap<>();
        data.put("total", list.size());
        data.put("list", list);
        return Result.success(data);
    }

    @GetMapping("/category/{categoryId}")
    public Result<List<Algorithm>> getByCategory(@PathVariable Long categoryId) {
        return Result.success(algorithmService.getAlgorithmsByCategory(categoryId));
    }

    @GetMapping("/difficulty/{difficulty}")
    public Result<List<Algorithm>> getByDifficulty(@PathVariable String difficulty) {
        return Result.success(algorithmService.getAlgorithmsByDifficulty(difficulty));
    }
}
