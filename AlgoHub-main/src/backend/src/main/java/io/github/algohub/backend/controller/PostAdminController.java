package io.github.algohub.backend.controller;

import io.github.algohub.backend.common.PageResult;
import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.entity.PostReport;
import io.github.algohub.backend.service.PostService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class PostAdminController {

    @Autowired
    private PostService postService;

    private boolean isAdminOrAbove(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        return "ADMIN".equals(role) || "MASTER".equals(role);
    }

    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }

    @GetMapping("/reports")
    public Result<PageResult<PostReport>> getReports(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {
        if (!isAdminOrAbove(request)) {
            return Result.error(403, "无权限，仅管理员及以上可操作");
        }
        return Result.success(postService.getReports(page, pageSize, status));
    }

    @PutMapping("/reports/{id}/resolve")
    public Result<String> resolveReport(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdminOrAbove(request)) {
            return Result.error(403, "无权限，仅管理员及以上可操作");
        }
        postService.resolveReport(id, getUserId(request));
        return Result.success("举报已处理，内容已删除");
    }

    @PutMapping("/reports/{id}/dismiss")
    public Result<String> dismissReport(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdminOrAbove(request)) {
            return Result.error(403, "无权限，仅管理员及以上可操作");
        }
        postService.dismissReport(id, getUserId(request));
        return Result.success("举报已驳回");
    }

    @DeleteMapping("/posts/{id}")
    public Result<String> deletePost(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdminOrAbove(request)) {
            return Result.error(403, "无权限，仅管理员及以上可操作");
        }
        postService.adminDeletePost(id);
        return Result.success("帖子已删除");
    }

    @DeleteMapping("/comments/{id}")
    public Result<String> deleteComment(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdminOrAbove(request)) {
            return Result.error(403, "无权限，仅管理员及以上可操作");
        }
        postService.adminDeleteComment(id);
        return Result.success("评论已删除");
    }
}
