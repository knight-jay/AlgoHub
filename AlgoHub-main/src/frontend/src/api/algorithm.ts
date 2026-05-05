import client from './client'
import type { Result, Algorithm, AlgorithmCategory, PageResult } from '../types'

export const algorithmApi = {
  getCategories: () =>
    client.get<Result<AlgorithmCategory[]>>('/algorithm/categories'),

  getSubCategories: (parentId: number) =>
    client.get<Result<AlgorithmCategory[]>>(`/algorithm/categories/${parentId}/children`),

  getDetail: (id: number) =>
    client.get<Result<Algorithm>>(`/algorithm/${id}`),

  search: (keyword: string, page = 1, pageSize = 10) =>
    client.get<Result<PageResult<Algorithm>>>('/algorithm/search', {
      params: { keyword, page, pageSize },
    }),

  getByCategory: (categoryId: number, page = 1, pageSize = 10) =>
    client.get<Result<PageResult<Algorithm>>>(`/algorithm/category/${categoryId}`, {
      params: { page, pageSize },
    }),

  getByDifficulty: (difficulty: string, page = 1, pageSize = 10) =>
    client.get<Result<PageResult<Algorithm>>>(`/algorithm/difficulty/${difficulty}`, {
      params: { page, pageSize },
    }),
}
