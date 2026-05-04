package io.github.algohub.backend.controller;

import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.entity.Algorithm;
import io.github.algohub.backend.entity.AlgorithmCategory;
import io.github.algohub.backend.repository.AlgorithmCategoryRepository;
import io.github.algohub.backend.service.AlgorithmService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/algorithm")
public class AlgorithmAdminController {

    @Autowired
    private AlgorithmService algorithmService;

    @Autowired
    private AlgorithmCategoryRepository categoryRepo;

    private boolean isAdmin(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        return "ADMIN".equals(role);
    }

    @PostMapping
    public Result<Algorithm> create(@RequestBody Algorithm algorithm, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        return Result.success(algorithmService.saveAlgorithm(algorithm));
    }

    @PutMapping("/{id}")
    public Result<Algorithm> update(@PathVariable Long id, @RequestBody Algorithm algorithm, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        Algorithm updated = algorithmService.updateAlgorithm(id, algorithm);
        if (updated == null) {
            return Result.error("算法不存在");
        }
        return Result.success(updated);
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        algorithmService.deleteAlgorithm(id);
        return Result.success("删除成功");
    }

    @PostMapping("/category")
    public Result<AlgorithmCategory> createCategory(@RequestBody AlgorithmCategory category, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        return Result.success(categoryRepo.save(category));
    }

    @PutMapping("/category/{id}")
    public Result<AlgorithmCategory> updateCategory(@PathVariable Long id, @RequestBody AlgorithmCategory category, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        AlgorithmCategory exist = categoryRepo.findById(id).orElse(null);
        if (exist == null) {
            return Result.error("分类不存在");
        }
        if (category.getName() != null) exist.setName(category.getName());
        if (category.getParentId() != null) exist.setParentId(category.getParentId());
        if (category.getSortOrder() != null) exist.setSortOrder(category.getSortOrder());
        return Result.success(categoryRepo.save(exist));
    }

    @DeleteMapping("/category/{id}")
    public Result<String> deleteCategory(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        categoryRepo.deleteById(id);
        return Result.success("删除成功");
    }
}
