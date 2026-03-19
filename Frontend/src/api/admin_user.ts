import { http } from '@/lib/request'

const API_BASE = '/api/forum/admin/user'

export const adminUserApi = {
  /**
   * 获取用户列表
   */
  getUserList: (params?: { keyword?: string; page?: number; pageSize?: number }) =>
    http.get<{
      list: Array<{
        _id: string
        userName: string
        displayName: string
        email: string
        phone: string
        avatar: string
        role: string
        isBanned: boolean
        createdAt: string
        lastLoginAt: string
      }>
      pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
      }
    }>(`${API_BASE}/list`, { params }),

  /**
   * 变更用户角色
   */
  changeRole: (userId: string, role: string) =>
    http.post<{ success: boolean; message: string }>(`${API_BASE}/role`, { userId, role }),

  /**
   * 封禁用户
   */
  banUser: (userId: string) =>
    http.post<{ success: boolean; message: string }>(`${API_BASE}/ban`, { userId }),

  /**
   * 解封用户
   */
  unbanUser: (userId: string) =>
    http.post<{ success: boolean; message: string }>(`${API_BASE}/unban`, { userId }),
}
