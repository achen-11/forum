import { http } from '@/lib/request'

const API_BASE = '/api/forum/admin/log'

export const adminLogApi = {
  /**
   * 获取日志列表
   */
  getLogList: (params?: {
    page?: number
    pageSize?: number
    actionType?: string
    targetType?: string
    operatorId?: string
  }) =>
    http.get<{
      list: Array<{
        _id: string
        operatorId: string
        operatorName: string
        action: string
        targetType: string
        targetId: string
        detail: Record<string, any> | null
        createdAt: string
      }>
      pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
      }
    }>(`${API_BASE}/list`, { params }),

  /**
   * 获取操作类型统计
   */
  getStats: () =>
    http.get<{
      stats: Array<{
        action: string
        count: number
      }>
    }>(`${API_BASE}/stats`),
}
