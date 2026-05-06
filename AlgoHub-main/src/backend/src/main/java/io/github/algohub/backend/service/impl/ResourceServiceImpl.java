package io.github.algohub.backend.service.impl;

import io.github.algohub.backend.common.PageResult;
import io.github.algohub.backend.entity.Resource;
import io.github.algohub.backend.entity.ResourceCategory;
import io.github.algohub.backend.repository.ResourceCategoryRepository;
import io.github.algohub.backend.repository.ResourceRepository;
import io.github.algohub.backend.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResourceServiceImpl implements ResourceService {

    @Autowired
    private ResourceCategoryRepository categoryRepo;

    @Autowired
    private ResourceRepository resourceRepo;

    @Override
    @Transactional(readOnly = true)
    public List<ResourceCategory> getAllCategories() {
        return categoryRepo.findAllByOrderBySortOrderAsc();
    }

    @Override
    public Resource getResourceDetail(Long id) {
        return resourceRepo.findById(id).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<Resource> searchResources(String keyword, int page, int pageSize) {
        PageRequest pr = PageRequest.of(page - 1, pageSize);
        Page<Resource> result;
        if (keyword == null || keyword.trim().isEmpty()) {
            result = resourceRepo.findAll(pr);
        } else {
            result = resourceRepo.searchByKeyword(keyword.trim(), pr);
        }
        return new PageResult<>(result.getContent(), result.getTotalElements(), page, pageSize);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<Resource> getResourcesByCategory(Long categoryId, int page, int pageSize) {
        PageRequest pr = PageRequest.of(page - 1, pageSize);
        Page<Resource> result = resourceRepo.findByCategoryIdOrderBySortOrderAsc(categoryId, pr);
        return new PageResult<>(result.getContent(), result.getTotalElements(), page, pageSize);
    }

    @Override
    public Resource saveResource(Resource resource) {
        resource.setCreateTime(LocalDateTime.now());
        resource.setUpdateTime(LocalDateTime.now());
        return resourceRepo.save(resource);
    }

    @Override
    public Resource updateResource(Long id, Resource updated) {
        Resource exist = resourceRepo.findById(id).orElse(null);
        if (exist == null) return null;
        if (updated.getTitle() != null) exist.setTitle(updated.getTitle());
        if (updated.getDescription() != null) exist.setDescription(updated.getDescription());
        if (updated.getUrl() != null) exist.setUrl(updated.getUrl());
        if (updated.getCategoryId() != null) exist.setCategoryId(updated.getCategoryId());
        if (updated.getSortOrder() != null) exist.setSortOrder(updated.getSortOrder());
        exist.setUpdateTime(LocalDateTime.now());
        return resourceRepo.save(exist);
    }

    @Override
    public void deleteResource(Long id) {
        resourceRepo.deleteById(id);
    }
}
