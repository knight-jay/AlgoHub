package io.github.algohub.backend.controller;

import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.entity.Resource;
import io.github.algohub.backend.entity.ResourceCategory;
import io.github.algohub.backend.repository.ResourceCategoryRepository;
import io.github.algohub.backend.service.ResourceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/resources")
public class ResourceAdminController {

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private ResourceCategoryRepository categoryRepo;

    private boolean isAdmin(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        return "ADMIN".equals(role) || "MASTER".equals(role);
    }

    @PostMapping
    public Result<Resource> create(@RequestBody Resource resource, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        return Result.success(resourceService.saveResource(resource));
    }

    @PutMapping("/{id}")
    public Result<Resource> update(@PathVariable Long id, @RequestBody Resource resource, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        Resource updated = resourceService.updateResource(id, resource);
        if (updated == null) {
            return Result.error("资源不存在");
        }
        return Result.success(updated);
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        resourceService.deleteResource(id);
        return Result.success("删除成功");
    }

    @PostMapping("/category")
    public Result<ResourceCategory> createCategory(@RequestBody ResourceCategory category, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        category.setCreateTime(LocalDateTime.now());
        return Result.success(categoryRepo.save(category));
    }

    @PutMapping("/category/{id}")
    public Result<ResourceCategory> updateCategory(@PathVariable Long id, @RequestBody ResourceCategory category, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return Result.error(403, "无权限，仅管理员可操作");
        }
        ResourceCategory exist = categoryRepo.findById(id).orElse(null);
        if (exist == null) {
            return Result.error("分类不存在");
        }
        if (category.getName() != null) exist.setName(category.getName());
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
