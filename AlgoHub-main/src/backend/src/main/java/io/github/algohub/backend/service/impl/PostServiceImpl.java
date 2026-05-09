package io.github.algohub.backend.service.impl;

import io.github.algohub.backend.common.PageResult;
import io.github.algohub.backend.dto.CreateCommentDTO;
import io.github.algohub.backend.dto.CreatePostDTO;
import io.github.algohub.backend.dto.UpdatePostDTO;
import io.github.algohub.backend.entity.*;
import io.github.algohub.backend.repository.*;
import io.github.algohub.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepo;
    @Autowired
    private CommentRepository commentRepo;
    @Autowired
    private PostLikeRepository likeRepo;
    @Autowired
    private PostFavoriteRepository favRepo;
    @Autowired
    private PostFollowRepository followRepo;
    @Autowired
    private UserFollowRepository userFollowRepo;
    @Autowired
    private PostReportRepository reportRepo;
    @Autowired
    private UserRepository userRepo;

    // ==================== 帖子 ====================

    @Override
    @Transactional(readOnly = true)
    public PageResult<Post> listPosts(int page, int pageSize, String sort) {
        PageRequest pr = PageRequest.of(page - 1, pageSize);
        Page<Post> result;
        if ("hot".equals(sort)) {
            result = postRepo.findAllByOrderByLikeCountDescCreateTimeDesc(pr);
        } else {
            result = postRepo.findAllByOrderByCreateTimeDesc(pr);
        }
        clearSensitiveFields(result.getContent());
        return new PageResult<>(result.getContent(), result.getTotalElements(), page, pageSize);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<Post> searchPosts(String keyword, int page, int pageSize) {
        PageRequest pr = PageRequest.of(page - 1, pageSize);
        Page<Post> result;
        if (keyword == null || keyword.trim().isEmpty()) {
            return new PageResult<>(List.of(), 0, page, pageSize);
        } else {
            result = postRepo.searchByKeyword(keyword.trim(), pr);
        }
        clearSensitiveFields(result.getContent());
        return new PageResult<>(result.getContent(), result.getTotalElements(), page, pageSize);
    }

    @Override
    @Transactional(readOnly = true)
    public Post getPostDetail(Long id, Long currentUserId) {
        Post post = postRepo.findById(id).orElse(null);
        if (post != null) {
            if (post.getUser() != null) {
                post.getUser().setPassword(null);
            }
            if (currentUserId != null) {
                post.setIsLiked(likeRepo.existsByPostIdAndUserId(id, currentUserId));
                post.setIsFavorited(favRepo.existsByPostIdAndUserId(id, currentUserId));
                post.setIsFollowed(followRepo.existsByPostIdAndUserId(id, currentUserId));
            }
        }
        return post;
    }

    @Override
    public Post createPost(CreatePostDTO dto, Long userId) {
        Post post = new Post();
        post.setTitle(dto.getTitle().trim());
        post.setContent(dto.getContent() != null ? dto.getContent().trim() : "");
        post.setUserId(userId);
        post.setLikeCount(0);
        post.setCommentCount(0);
        post.setCreateTime(LocalDateTime.now());
        post.setUpdateTime(LocalDateTime.now());
        return postRepo.save(post);
    }

    @Override
    public Post updatePost(Long id, UpdatePostDTO dto, Long userId) {
        Post post = postRepo.findById(id).orElse(null);
        if (post == null) return null;
        if (!post.getUserId().equals(userId)) return null;
        if (dto.getTitle() != null) post.setTitle(dto.getTitle().trim());
        if (dto.getContent() != null) post.setContent(dto.getContent().trim());
        post.setUpdateTime(LocalDateTime.now());
        return postRepo.save(post);
    }

    @Override
    @Transactional
    public boolean deletePost(Long id, Long userId) {
        Post post = postRepo.findById(id).orElse(null);
        if (post == null) return false;
        if (!post.getUserId().equals(userId)) return false;
        commentRepo.findByPostId(id).forEach(c -> commentRepo.delete(c));
        likeRepo.deleteByPostId(id);
        favRepo.deleteByPostId(id);
        followRepo.deleteByPostId(id);
        reportRepo.deleteByPostId(id);
        postRepo.delete(post);
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<Post> getMyPosts(Long userId, int page, int pageSize) {
        PageRequest pr = PageRequest.of(page - 1, pageSize);
        Page<Post> result = postRepo.findByUserIdOrderByCreateTimeDesc(userId, pr);
        clearSensitiveFields(result.getContent());
        return new PageResult<>(result.getContent(), result.getTotalElements(), page, pageSize);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<Post> getMyFavorites(Long userId, int page, int pageSize) {
        PageRequest pr = PageRequest.of(page - 1, pageSize);
        Page<Long> postIds = favRepo.findPostIdsByUserId(userId, pr);
        List<Long> ids = postIds.getContent();
        if (ids.isEmpty()) {
            return new PageResult<>(List.of(), postIds.getTotalElements(), page, pageSize);
        }
        List<Post> posts = postRepo.findAllByIdIn(ids);
        // 按收藏时间倒序排列（即 ids 的顺序）
        Map<Long, Post> postMap = new java.util.HashMap<>();
        for (Post p : posts) postMap.put(p.getId(), p);
        List<Post> ordered = new java.util.ArrayList<>();
        for (Long id : ids) {
            Post p = postMap.get(id);
            if (p != null) ordered.add(p);
        }
        clearSensitiveFields(ordered);
        return new PageResult<>(ordered, postIds.getTotalElements(), page, pageSize);
    }

    // ==================== 点赞 ====================

    @Override
    @Transactional
    public boolean toggleLike(Long postId, Long userId) {
        if (!postRepo.existsById(postId)) throw new IllegalArgumentException("帖子不存在");
        PostLike existing = likeRepo.findByPostIdAndUserId(postId, userId);
        if (existing != null) {
            likeRepo.delete(existing);
            postRepo.decrementLikeCount(postId);
            return false;
        } else {
            PostLike like = new PostLike();
            like.setPostId(postId);
            like.setUserId(userId);
            like.setCreateTime(LocalDateTime.now());
            likeRepo.save(like);
            postRepo.incrementLikeCount(postId);
            return true;
        }
    }

    // ==================== 收藏 ====================

    @Override
    @Transactional
    public boolean toggleFavorite(Long postId, Long userId) {
        PostFavorite existing = favRepo.findByPostIdAndUserId(postId, userId);
        if (existing != null) {
            favRepo.delete(existing);
            return false;
        } else {
            PostFavorite fav = new PostFavorite();
            fav.setPostId(postId);
            fav.setUserId(userId);
            fav.setCreateTime(LocalDateTime.now());
            favRepo.save(fav);
            return true;
        }
    }

    // ==================== 关注帖子 ====================

    @Override
    @Transactional
    public boolean toggleFollowPost(Long postId, Long userId) {
        PostFollow existing = followRepo.findByPostIdAndUserId(postId, userId);
        if (existing != null) {
            followRepo.delete(existing);
            return false;
        } else {
            PostFollow pf = new PostFollow();
            pf.setPostId(postId);
            pf.setUserId(userId);
            pf.setCreateTime(LocalDateTime.now());
            followRepo.save(pf);
            return true;
        }
    }

    // ==================== 评论 ====================

    @Override
    @Transactional(readOnly = true)
    public PageResult<Comment> getComments(Long postId, int page, int pageSize) {
        PageRequest pr = PageRequest.of(page - 1, pageSize);
        Page<Comment> result = commentRepo.findByPostIdOrderByCreateTimeAsc(postId, pr);
        result.getContent().forEach(c -> {
            if (c.getUser() != null) c.getUser().setPassword(null);
        });
        return new PageResult<>(result.getContent(), result.getTotalElements(), page, pageSize);
    }

    @Override
    @Transactional
    public Comment createComment(CreateCommentDTO dto, Long userId) {
        Comment comment = new Comment();
        comment.setPostId(dto.getPostId());
        comment.setUserId(userId);
        comment.setParentId(dto.getParentId());
        comment.setContent(dto.getContent().trim());
        comment.setCreateTime(LocalDateTime.now());
        Comment saved = commentRepo.save(comment);
        postRepo.syncCommentCount(dto.getPostId());
        return saved;
    }

    @Override
    @Transactional
    public boolean deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepo.findById(commentId).orElse(null);
        if (comment == null) return false;
        // 允许评论作者或帖子作者删除评论
        Post post = postRepo.findById(comment.getPostId()).orElse(null);
        if (!comment.getUserId().equals(userId) && (post == null || !post.getUserId().equals(userId))) return false;
        Long postId = comment.getPostId();
        commentRepo.delete(comment);
        postRepo.syncCommentCount(postId);
        return true;
    }

    // ==================== 举报 ====================

    @Override
    public void reportPost(Long postId, Long userId, String reason) {
        PostReport report = new PostReport();
        report.setPostId(postId);
        report.setReporterId(userId);
        report.setReason(reason);
        report.setStatus("PENDING");
        report.setCreateTime(LocalDateTime.now());
        reportRepo.save(report);
    }

    @Override
    public void reportComment(Long commentId, Long userId, String reason) {
        Comment comment = commentRepo.findById(commentId).orElse(null);
        if (comment == null) return;
        PostReport report = new PostReport();
        report.setPostId(comment.getPostId());
        report.setCommentId(commentId);
        report.setReporterId(userId);
        report.setReason(reason);
        report.setStatus("PENDING");
        report.setCreateTime(LocalDateTime.now());
        reportRepo.save(report);
    }

    // ==================== 关注用户 ====================

    @Override
    @Transactional
    public boolean toggleFollowUser(Long followedId, Long followerId) {
        if (followedId.equals(followerId)) return false;
        UserFollow existing = userFollowRepo.findByFollowerIdAndFollowedId(followerId, followedId);
        if (existing != null) {
            userFollowRepo.delete(existing);
            return false;
        } else {
            UserFollow uf = new UserFollow();
            uf.setFollowerId(followerId);
            uf.setFollowedId(followedId);
            uf.setCreateTime(LocalDateTime.now());
            userFollowRepo.save(uf);
            return true;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<User> getFollowedUsers(Long userId, int page, int pageSize) {
        PageRequest pr = PageRequest.of(page - 1, pageSize);
        Page<Long> ids = userFollowRepo.findFollowedUserIdsByFollowerId(userId, pr);
        List<Long> idList = ids.getContent();
        if (idList.isEmpty()) {
            return new PageResult<>(List.of(), ids.getTotalElements(), page, pageSize);
        }
        List<User> users = userRepo.findAllById(idList);
        for (User u : users) u.setPassword(null);
        Map<Long, User> userMap = new java.util.HashMap<>();
        for (User u : users) userMap.put(u.getId(), u);
        List<User> ordered = new java.util.ArrayList<>();
        for (Long id : idList) {
            User u = userMap.get(id);
            if (u != null) ordered.add(u);
        }
        return new PageResult<>(ordered, ids.getTotalElements(), page, pageSize);
    }

    // ==================== 查看用户公开信息 ====================

    @Override
    @Transactional(readOnly = true)
    public User getUserProfile(Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user != null) {
            user.setPassword(null);
        }
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<Post> getUserPosts(Long userId, int page, int pageSize) {
        return getMyPosts(userId, page, pageSize);
    }

    // ==================== 管理员 ====================

    @Override
    @Transactional(readOnly = true)
    public PageResult<PostReport> getReports(int page, int pageSize, String status) {
        PageRequest pr = PageRequest.of(page - 1, pageSize);
        Page<PostReport> result;
        if (status != null && !status.trim().isEmpty()) {
            result = reportRepo.findByStatusOrderByCreateTimeDesc(status.trim().toUpperCase(), pr);
        } else {
            result = reportRepo.findAllByOrderByCreateTimeDesc(pr);
        }
        return new PageResult<>(result.getContent(), result.getTotalElements(), page, pageSize);
    }

    @Override
    @Transactional
    public void resolveReport(Long reportId, Long handlerId) {
        PostReport report = reportRepo.findById(reportId).orElse(null);
        if (report == null || !"PENDING".equals(report.getStatus())) return;
        if (report.getCommentId() != null) {
            commentRepo.deleteById(report.getCommentId());
            reportRepo.deleteByCommentId(report.getCommentId());
        } else if (report.getPostId() != null) {
            Long postId = report.getPostId();
            commentRepo.findByPostId(postId).forEach(c -> commentRepo.delete(c));
            likeRepo.deleteByPostId(postId);
            favRepo.deleteByPostId(postId);
            followRepo.deleteByPostId(postId);
            reportRepo.deleteByPostId(postId);
            postRepo.deleteById(postId);
        }
        report.setStatus("RESOLVED");
        report.setHandlerId(handlerId);
        report.setHandleTime(LocalDateTime.now());
        reportRepo.save(report);
    }

    @Override
    @Transactional
    public void dismissReport(Long reportId, Long handlerId) {
        PostReport report = reportRepo.findById(reportId).orElse(null);
        if (report == null || !"PENDING".equals(report.getStatus())) return;
        report.setStatus("DISMISSED");
        report.setHandlerId(handlerId);
        report.setHandleTime(LocalDateTime.now());
        reportRepo.save(report);
    }

    @Override
    @Transactional
    public void adminDeletePost(Long postId) {
        commentRepo.findByPostId(postId).forEach(c -> commentRepo.delete(c));
        likeRepo.deleteByPostId(postId);
        favRepo.deleteByPostId(postId);
        followRepo.deleteByPostId(postId);
        reportRepo.deleteByPostId(postId);
        postRepo.deleteById(postId);
    }

    @Override
    @Transactional
    public void adminDeleteComment(Long commentId) {
        Comment comment = commentRepo.findById(commentId).orElse(null);
        if (comment == null) return;
        Long postId = comment.getPostId();
        commentRepo.delete(comment);
        postRepo.syncCommentCount(postId);
    }

    private void clearSensitiveFields(List<Post> posts) {
        for (Post p : posts) {
            if (p.getUser() != null) {
                p.getUser().setPassword(null);
            }
        }
    }
}
