import { http } from '@/lib/request'

const API_BASE = '/api/forum/admin/content'

export const adminContentApi = {
  /**
   * 获取帖子列表（管理员）
   */
  getPostList: (params?: { page?: number; pageSize?: number }) =>
    http.get<{
      list: Array<{
        _id: string
        title: string
        content: string
        summary: string
        viewCount: number
        replyCount: number
        likeCount: number
        isPinned: boolean
        isEdited: boolean
        editedAt?: number
        isDeleted: boolean
        createdAt: string
        updatedAt: string
        author: {
          _id: string
          userName: string
          displayName: string
          avatar: string
          role: string
        }
        category: {
          _id: string
          name: string
        } | null
      }>
      pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
      }
    }>(`${API_BASE}/post/list`, { params }),

  /**
   * 删除帖子
   */
  deletePost: (postId: string) =>
    http.post<{ success: boolean; message: string }>(`${API_BASE}/post/delete`, { postId }),

  /**
   * 置顶/取消置顶帖子
   */
  pinPost: (postId: string, isPinned: boolean) =>
    http.post<{ success: boolean; message: string }>(`${API_BASE}/post/pin`, { postId, isPinned }),

  /**
   * 获取回复列表（管理员）
   */
  getReplyList: (params?: { postId?: string; page?: number; pageSize?: number }) =>
    http.get<{
      list: Array<{
        _id: string
        content: string
        postId: string
        parentId: string
        isDeleted: boolean
        createdAt: string
        updatedAt: string
        author: {
          _id: string
          userName: string
          displayName: string
          avatar: string
          role: string
        }
        postTitle?: string
      }>
      pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
      }
    }>(`${API_BASE}/reply/list`, { params }),

  /**
   * 删除回复
   */
  deleteReply: (replyId: string) =>
    http.post<{ success: boolean; message: string }>(`${API_BASE}/reply/delete`, { replyId }),
}
