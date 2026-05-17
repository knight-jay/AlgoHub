import client from './client'
import type { Result, PageResult, Post, Comment, PostReport, User, Resource, ResourceCategory, CreatePostData, UpdatePostData, CreateCommentData } from '../types'

export const postApi = {
  // 帖子
  list: (page = 1, pageSize = 10, sort = 'time') =>
    client.get<Result<PageResult<Post>>>('/posts', { params: { page, pageSize, sort } }),

  search: (keyword: string, page = 1, pageSize = 10) =>
    client.get<Result<PageResult<Post>>>('/posts/search', { params: { keyword, page, pageSize } }),

  myPosts: (page = 1, pageSize = 10) =>
    client.get<Result<PageResult<Post>>>('/posts/my', { params: { page, pageSize } }),

  myFavorites: (page = 1, pageSize = 10) =>
    client.get<Result<PageResult<Post>>>('/posts/favorites', { params: { page, pageSize } }),

  getDetail: (id: number) =>
    client.get<Result<Post>>(`/posts/${id}`),

  create: (data: CreatePostData) =>
    client.post<Result<Post>>('/posts', data),

  update: (id: number, data: UpdatePostData) =>
    client.put<Result<Post>>(`/posts/${id}`, data),

  delete: (id: number) =>
    client.delete<Result<string>>(`/posts/${id}`),

  // 点赞/收藏/关注
  toggleLike: (id: number) =>
    client.post<Result<string>>(`/posts/${id}/like`),

  toggleFavorite: (id: number) =>
    client.post<Result<string>>(`/posts/${id}/favorite`),

  toggleFollowPost: (id: number) =>
    client.post<Result<string>>(`/posts/${id}/follow`),

  // 举报
  reportPost: (id: number, reason: string) =>
    client.post<Result<string>>(`/posts/${id}/report`, { reason }),

  reportComment: (id: number, reason: string) =>
    client.post<Result<string>>(`/comments/${id}/report`, { reason }),

  // 评论
  getComments: (postId: number, page = 1, pageSize = 20) =>
    client.get<Result<PageResult<Comment>>>(`/posts/${postId}/comments`, { params: { page, pageSize } }),

  createComment: (postId: number, data: CreateCommentData) =>
    client.post<Result<Comment>>(`/posts/${postId}/comments`, data),

  deleteComment: (id: number) =>
    client.delete<Result<string>>(`/comments/${id}`),

  // 关注用户
  toggleFollowUser: (userId: number) =>
    client.post<Result<string>>(`/users/${userId}/follow`),

  getFollowedUsers: (page = 1, pageSize = 10) =>
    client.get<Result<PageResult<User>>>('/users/following', { params: { page, pageSize } }),

  // 用户公开信息
  getUserProfile: (userId: number) =>
    client.get<Result<User>>(`/users/${userId}`),

  getUserPosts: (userId: number, page = 1, pageSize = 10) =>
    client.get<Result<PageResult<Post>>>(`/users/${userId}/posts`, { params: { page, pageSize } }),
}

export const adminPostApi = {
  getReports: (page = 1, pageSize = 10, status?: string) =>
    client.get<Result<PageResult<PostReport>>>('/admin/reports', { params: { page, pageSize, status } }),

  resolveReport: (id: number) =>
    client.put<Result<string>>(`/admin/reports/${id}/resolve`),

  dismissReport: (id: number) =>
    client.put<Result<string>>(`/admin/reports/${id}/dismiss`),

  deletePost: (id: number) =>
    client.delete<Result<string>>(`/admin/posts/${id}`),

  deleteComment: (id: number) =>
    client.delete<Result<string>>(`/admin/comments/${id}`),
}

export const adminResourceApi = {
  createResource: (data: { title: string; description?: string; url: string; categoryId: number | null; sortOrder?: number }) =>
    client.post<Result<Resource>>('/admin/resources', data),

  updateResource: (id: number, data: { title?: string; description?: string; url?: string; categoryId?: number | null; sortOrder?: number }) =>
    client.put<Result<Resource>>(`/admin/resources/${id}`, data),

  deleteResource: (id: number) =>
    client.delete<Result<string>>(`/admin/resources/${id}`),

  createCategory: (data: { name: string; sortOrder?: number }) =>
    client.post<Result<ResourceCategory>>('/admin/resources/category', data),

  updateCategory: (id: number, data: { name?: string; sortOrder?: number }) =>
    client.put<Result<ResourceCategory>>(`/admin/resources/category/${id}`, data),

  deleteCategory: (id: number) =>
    client.delete<Result<string>>(`/admin/resources/category/${id}`),
}
