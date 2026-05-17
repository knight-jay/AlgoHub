package io.github.algohub.backend.controller;

import io.github.algohub.backend.common.PageResult;
import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.entity.Resource;
import io.github.algohub.backend.entity.ResourceCategory;
import io.github.algohub.backend.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @GetMapping("/categories")
    public Result<List<ResourceCategory>> getCategories() {
        return Result.success(resourceService.getAllCategories());
    }

    @GetMapping("/{id}")
    public Result<Resource> getDetail(@PathVariable Long id) {
        Resource r = resourceService.getResourceDetail(id);
        if (r == null) {
            return Result.error("资源不存在");
        }
        return Result.success(r);
    }

    @GetMapping("/search")
    public Result<PageResult<Resource>> search(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int pageSize) {
        return Result.success(resourceService.searchResources(keyword.trim(), page, pageSize));
    }

    @GetMapping("/category/{categoryId}")
    public Result<PageResult<Resource>> getByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int pageSize) {
        return Result.success(resourceService.getResourcesByCategory(categoryId, page, pageSize));
    }
}
