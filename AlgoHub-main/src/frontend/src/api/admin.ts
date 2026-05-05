import client from './client'
import type { Result, User, Algorithm, AlgorithmCategory, PageResult } from '../types'

export const adminApi = {
  // 用户管理
  listUsers: (page = 1, pageSize = 10) =>
    client.get<Result<PageResult<User>>>('/admin/users', { params: { page, pageSize } }),

  toggleUserStatus: (id: number, locked: number) =>
    client.put<Result<string>>(`/admin/users/${id}/status`, { locked }),

  changeUserRole: (id: number, role: string) =>
    client.put<Result<string>>(`/admin/users/${id}/role`, { role }),

  // 算法管理
  createAlgorithm: (data: Partial<Algorithm>) =>
    client.post<Result<Algorithm>>('/admin/algorithm', data),

  updateAlgorithm: (id: number, data: Partial<Algorithm>) =>
    client.put<Result<Algorithm>>(`/admin/algorithm/${id}`, data),

  deleteAlgorithm: (id: number) =>
    client.delete<Result<string>>(`/admin/algorithm/${id}`),

  // 分类管理
  createCategory: (data: Partial<AlgorithmCategory>) =>
    client.post<Result<AlgorithmCategory>>('/admin/algorithm/category', data),

  updateCategory: (id: number, data: Partial<AlgorithmCategory>) =>
    client.put<Result<AlgorithmCategory>>(`/admin/algorithm/category/${id}`, data),

  deleteCategory: (id: number) =>
    client.delete<Result<string>>(`/admin/algorithm/category/${id}`),
}
