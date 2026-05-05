import client from './client'
import type { Result, Algorithm, AlgorithmCategory, SearchResult } from '../types'

export const algorithmApi = {
  getCategories: () =>
    client.get<Result<AlgorithmCategory[]>>('/algorithm/categories'),

  getSubCategories: (parentId: number) =>
    client.get<Result<AlgorithmCategory[]>>(`/algorithm/categories/${parentId}/children`),

  getDetail: (id: number) =>
    client.get<Result<Algorithm>>(`/algorithm/${id}`),

  search: (keyword: string) =>
    client.get<Result<SearchResult>>('/algorithm/search', { params: { keyword } }),

  getByCategory: (categoryId: number) =>
    client.get<Result<Algorithm[]>>(`/algorithm/category/${categoryId}`),

  getByDifficulty: (difficulty: string) =>
    client.get<Result<Algorithm[]>>(`/algorithm/difficulty/${difficulty}`),
}
