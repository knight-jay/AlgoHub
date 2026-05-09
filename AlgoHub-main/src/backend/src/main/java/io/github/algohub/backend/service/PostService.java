package io.github.algohub.backend.service;

import io.github.algohub.backend.common.PageResult;
import io.github.algohub.backend.dto.CreateCommentDTO;
import io.github.algohub.backend.dto.CreatePostDTO;
import io.github.algohub.backend.dto.UpdatePostDTO;
import io.github.algohub.backend.entity.*;

public interface PostService {
    // 帖子
    PageResult<Post> listPosts(int page, int pageSize, String sort);
    PageResult<Post> searchPosts(String keyword, int page, int pageSize);
    Post getPostDetail(Long id, Long currentUserId);
    Post createPost(CreatePostDTO dto, Long userId);
    Post updatePost(Long id, UpdatePostDTO dto, Long userId);
    boolean deletePost(Long id, Long userId);
    PageResult<Post> getMyPosts(Long userId, int page, int pageSize);
    PageResult<Post> getMyFavorites(Long userId, int page, int pageSize);

    // 点赞
    boolean toggleLike(Long postId, Long userId);

    // 收藏
    boolean toggleFavorite(Long postId, Long userId);

    // 关注帖子
    boolean toggleFollowPost(Long postId, Long userId);

    // 评论
    PageResult<Comment> getComments(Long postId, int page, int pageSize);
    Comment createComment(CreateCommentDTO dto, Long userId);
    boolean deleteComment(Long commentId, Long userId);

    // 举报
    void reportPost(Long postId, Long userId, String reason);
    void reportComment(Long commentId, Long userId, String reason);

    // 关注用户
    boolean toggleFollowUser(Long followedId, Long followerId);
    PageResult<User> getFollowedUsers(Long userId, int page, int pageSize);

    // 管理员
    PageResult<PostReport> getReports(int page, int pageSize, String status);
    void resolveReport(Long reportId, Long handlerId);
    void dismissReport(Long reportId, Long handlerId);
    void adminDeletePost(Long postId);
    void adminDeleteComment(Long commentId);
}
