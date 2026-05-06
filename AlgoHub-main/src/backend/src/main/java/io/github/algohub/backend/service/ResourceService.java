package io.github.algohub.backend.service;

import io.github.algohub.backend.common.PageResult;
import io.github.algohub.backend.entity.Resource;
import io.github.algohub.backend.entity.ResourceCategory;

import java.util.List;

public interface ResourceService {
    List<ResourceCategory> getAllCategories();
    Resource getResourceDetail(Long id);
    PageResult<Resource> searchResources(String keyword, int page, int pageSize);
    PageResult<Resource> getResourcesByCategory(Long categoryId, int page, int pageSize);
    Resource saveResource(Resource resource);
    Resource updateResource(Long id, Resource updated);
    void deleteResource(Long id);
}
