import { http } from '@/lib/request'

const API_BASE = '/api/forum/admin/category'

export const adminCategoryApi = {
  /**
   * 获取分类列表
   */
  getCategoryList: () =>
    http.get<{
      list: Array<{
        _id: string
        name: string
        description: string
        parentId: string
        sortOrder: number
        showOnHome: boolean
        isDeleted: boolean
        createdAt: string
        updatedAt: string
      }>
    }>(`${API_BASE}/list`),

  /**
   * 创建分类
   */
  createCategory: (data: {
    name: string
    description?: string
    parentId?: string
    sortOrder?: number
    showOnHome?: boolean
  }) =>
    http.post<{ category: any }>(`${API_BASE}/create`, data),

  /**
   * 更新分类
   */
  updateCategory: (data: {
    categoryId: string
    name?: string
    description?: string
    parentId?: string
    sortOrder?: number
    showOnHome?: boolean
  }) =>
    http.post<{ category: any }>(`${API_BASE}/update`, data),

  /**
   * 删除分类
   */
  deleteCategory: (categoryId: string) =>
    http.post<{ success: boolean; message: string }>(`${API_BASE}/delete`, { categoryId }),
}
