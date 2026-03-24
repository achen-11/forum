// @k-url /api/forum/notification/{action}

import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } from 'code/Services/NotificationService'
import { successResponse, failResponse } from 'code/Utils/ResponseUtils'
import { ForumPostService } from 'code/Services/ForumPostService'

/**
 * 获取通知列表
 */
k.api.get('list', () => {
  try {
    const userId = ForumPostService.getCurrentUserId()
    if (!userId) {
      return failResponse('请先登录', 401)
    }

    const page = parseInt(k.request.get('page') || '1', 10)
    const pageSize = parseInt(k.request.get('pageSize') || '20', 10)
    const type = k.request.get('type') || undefined
    const isRead = k.request.get('isRead')

    const options: any = { page, size: pageSize }
    if (type) {
      options.type = type
    }
    if (isRead !== undefined) {
      options.isRead = isRead === 'true'
    }

    const result = getUserNotifications(userId, options)
    return successResponse(result)
  } catch (e: any) {
    return failResponse(e?.message || '获取通知列表失败')
  }
})

/**
 * 获取未读通知数量
 */
k.api.get('unread-count', () => {
  try {
    const userId = ForumPostService.getCurrentUserId()
    if (!userId) {
      return failResponse('请先登录', 401)
    }

    const count = getUnreadCount(userId)
    return successResponse({ count })
  } catch (e: any) {
    return failResponse(e?.message || '获取未读数量失败')
  }
})

/**
 * 标记单条通知为已读
 */
k.api.post('mark-read', () => {
  try {
    const userId = ForumPostService.getCurrentUserId()
    if (!userId) {
      return failResponse('请先登录', 401)
    }

    const bodyStr = k.request.body
    let body: { notificationId?: string }
    try {
      body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
    } catch {
      return failResponse('请求参数格式错误')
    }

    const { notificationId } = body
    if (!notificationId) {
      return failResponse('缺少通知ID')
    }

    const success = markAsRead(notificationId, userId)
    if (success) {
      return successResponse({ success: true })
    } else {
      return failResponse('标记已读失败')
    }
  } catch (e: any) {
    return failResponse(e?.message || '标记已读失败')
  }
})

/**
 * 标记所有通知为已读
 */
k.api.post('mark-all-read', () => {
  try {
    const userId = ForumPostService.getCurrentUserId()
    if (!userId) {
      return failResponse('请先登录', 401)
    }

    const count = markAllAsRead(userId)
    return successResponse({ count })
  } catch (e: any) {
    return failResponse(e?.message || '标记已读失败')
  }
})
