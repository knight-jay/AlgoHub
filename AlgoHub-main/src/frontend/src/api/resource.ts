import client from './client'
import type { Result, PageResult, Resource, ResourceCategory } from '../types'

export const resourceApi = {
  getCategories: () =>
    client.get<Result<ResourceCategory[]>>('/resources/categories'),

  getDetail: (id: number) =>
    client.get<Result<Resource>>(`/resources/${id}`),

  search: (keyword = '', page = 1, pageSize = 12) =>
    client.get<Result<PageResult<Resource>>>('/resources/search', {
      params: { keyword, page, pageSize },
    }),

  getByCategory: (categoryId: number, page = 1, pageSize = 12) =>
    client.get<Result<PageResult<Resource>>>(`/resources/category/${categoryId}`, {
      params: { page, pageSize },
    }),
}
