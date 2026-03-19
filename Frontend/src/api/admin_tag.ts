import { http } from '@/lib/request'

const API_BASE = '/api/forum/admin/tag'

export const adminTagApi = {
  /**
   * 获取标签列表
   */
  getTagList: () =>
    http.get<{
      list: Array<{
        _id: string
        name: string
        color: string
        usageCount: number
        isDeleted: boolean
        createdAt: string
        updatedAt: string
      }>
    }>(`${API_BASE}/list`),

  /**
   * 创建标签
   */
  createTag: (data: { name: string; color?: string }) =>
    http.post<{ tag: any }>(`${API_BASE}/create`, data),

  /**
   * 更新标签
   */
  updateTag: (data: { tagId: string; name?: string; color?: string }) =>
    http.post<{ tag: any }>(`${API_BASE}/update`, data),

  /**
   * 删除标签
   */
  deleteTag: (tagId: string) =>
    http.post<{ success: boolean; message: string }>(`${API_BASE}/delete`, { tagId }),
}
