package io.github.algohub.backend.controller;

import io.github.algohub.backend.common.PageResult;
import io.github.algohub.backend.common.Result;
import io.github.algohub.backend.dto.CreateCommentDTO;
import io.github.algohub.backend.dto.CreatePostDTO;
import io.github.algohub.backend.dto.UpdatePostDTO;
import io.github.algohub.backend.entity.Comment;
import io.github.algohub.backend.entity.Post;
import io.github.algohub.backend.entity.User;
import io.github.algohub.backend.service.PostService;
import io.github.algohub.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private JwtUtil jwtUtil;

    /** 从 Authorization 头中提取 userId，未登录返回 null */
    private Long getUserIdOrNull(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        try {
            Claims claims = jwtUtil.extractClaims(auth.substring(7));
            if (jwtUtil.isTokenExpired(auth.substring(7))) return null;
            return claims.get("userId", Long.class);
        } catch (JwtException e) {
            return null;
        }
    }

    /** 用于需要登录的操作，未登录返回 null */
    private Long requireLogin(HttpServletRequest request) {
        return getUserIdOrNull(request);
    }

    // ==================== 帖子 ====================

    @GetMapping("/posts")
    public Result<PageResult<Post>> listPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "time") String sort) {
        return Result.success(postService.listPosts(page, pageSize, sort));
    }

    @GetMapping("/posts/search")
    public Result<PageResult<Post>> searchPosts(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        if (keyword.trim().isEmpty() && !keyword.isEmpty()) {
            return Result.error("搜索关键字不能为空");
        }
        return Result.success(postService.searchPosts(keyword.trim(), page, pageSize));
    }

    @GetMapping("/posts/my")
    public Result<PageResult<Post>> myPosts(HttpServletRequest request,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        return Result.success(postService.getMyPosts(userId, page, pageSize));
    }

    @GetMapping("/posts/favorites")
    public Result<PageResult<Post>> myFavorites(HttpServletRequest request,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        return Result.success(postService.getMyFavorites(userId, page, pageSize));
    }

    @GetMapping("/posts/{id}")
    public Result<Post> getPostDetail(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserIdOrNull(request);
        Post post = postService.getPostDetail(id, userId);
        if (post == null) {
            return Result.error("帖子不存在");
        }
        return Result.success(post);
    }

    @PostMapping("/posts")
    public Result<Post> createPost(@RequestBody CreatePostDTO dto, HttpServletRequest request) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            return Result.error("帖子标题不能为空");
        }
        return Result.success(postService.createPost(dto, userId));
    }

    @PutMapping("/posts/{id}")
    public Result<Post> updatePost(@PathVariable Long id, @RequestBody UpdatePostDTO dto, HttpServletRequest request) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        Post post = postService.updatePost(id, dto, userId);
        if (post == null) {
            return Result.error("帖子不存在或无权编辑");
        }
        return Result.success(post);
    }

    @DeleteMapping("/posts/{id}")
    public Result<String> deletePost(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        boolean deleted = postService.deletePost(id, userId);
        if (!deleted) return Result.error("帖子不存在或无权删除");
        return Result.success("删除成功");
    }

    // ==================== 点赞/收藏/关注帖子 ====================

    @PostMapping("/posts/{id}/like")
    public Result<String> toggleLike(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        try {
            boolean liked = postService.toggleLike(id, userId);
            return Result.success(liked ? "已点赞" : "已取消点赞");
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/posts/{id}/favorite")
    public Result<String> toggleFavorite(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        boolean faved = postService.toggleFavorite(id, userId);
        return Result.success(faved ? "已收藏" : "已取消收藏");
    }

    @PostMapping("/posts/{id}/follow")
    public Result<String> toggleFollowPost(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        boolean followed = postService.toggleFollowPost(id, userId);
        return Result.success(followed ? "已关注" : "已取消关注");
    }

    // ==================== 举报 ====================

    @PostMapping("/posts/{id}/report")
    public Result<String> reportPost(@PathVariable Long id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        String reason = body.getOrDefault("reason", "");
        postService.reportPost(id, userId, reason);
        return Result.success("举报已提交");
    }

    // ==================== 评论 ====================

    @GetMapping("/posts/{id}/comments")
    public Result<PageResult<Comment>> getComments(@PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return Result.success(postService.getComments(id, page, pageSize));
    }

    @PostMapping("/posts/{id}/comments")
    public Result<Comment> createComment(@PathVariable Long id, @RequestBody CreateCommentDTO dto, HttpServletRequest request) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            return Result.error("评论内容不能为空");
        }
        dto.setPostId(id);
        return Result.success(postService.createComment(dto, userId));
    }

    @DeleteMapping("/comments/{id}")
    public Result<String> deleteComment(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        boolean deleted = postService.deleteComment(id, userId);
        if (!deleted) return Result.error("评论不存在或无权删除");
        return Result.success("删除成功");
    }

    @PostMapping("/comments/{id}/report")
    public Result<String> reportComment(@PathVariable Long id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        String reason = body.getOrDefault("reason", "");
        postService.reportComment(id, userId, reason);
        return Result.success("举报已提交");
    }

    // ==================== 关注用户 ====================

    @PostMapping("/users/{id}/follow")
    public Result<String> toggleFollowUser(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        if (id.equals(userId)) return Result.error("不能关注自己");
        boolean followed = postService.toggleFollowUser(id, userId);
        return Result.success(followed ? "已关注" : "已取消关注");
    }

    @GetMapping("/users/following")
    public Result<PageResult<User>> getFollowing(HttpServletRequest request,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        Long userId = requireLogin(request);
        if (userId == null) return Result.error(401, "请先登录");
        return Result.success(postService.getFollowedUsers(userId, page, pageSize));
    }
}
