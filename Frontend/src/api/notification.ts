import { http } from '@/lib/request'

export interface NotificationItem {
  _id: string
  userId: string
  type: 'reply' | 'like_post' | 'like_reply' | 'follow' | 'best_answer' | 'system'
  title: string
  content: string
  targetId: string
  actorId: string
  actorName?: string
  actorAvatar?: string
  postTitle?: string
  isRead: boolean
  createdAt: number
}

export interface NotificationListResponse {
  items: NotificationItem[]
  total: number
}

export interface UnreadCountResponse {
  count: number
}

/**
 * 获取通知列表
 */
export function getNotificationList(params: {
  page?: number
  pageSize?: number
  type?: string
  isRead?: boolean
}) {
  return http.get<NotificationListResponse>('/api/forum/notification/list', { params })
}

/**
 * 获取未读通知数量
 */
export function getUnreadCount() {
  return http.get<UnreadCountResponse>('/api/forum/notification/unread-count')
}

/**
 * 标记单条通知为已读
 */
export function markNotificationRead(notificationId: string) {
  return http.post('/api/forum/notification/mark-read', { notificationId })
}

/**
 * 标记所有通知为已读
 */
export function markAllNotificationsRead() {
  return http.post('/api/forum/notification/mark-all-read')
}
