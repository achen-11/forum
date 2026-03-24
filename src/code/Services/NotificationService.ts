/**
 * 通知服务 - 处理通知相关的业务逻辑
 */

import { Forum_Notification, type NotificationTypeEnum } from 'code/Models/Forum_Notification'
import { Forum_User } from 'code/Models/Forum_User'
import { Forum_Post } from 'code/Models/Forum_Post'
import { SocketParser } from 'code/Utils/useSocket'

/**
 * 通知信息接口
 */
export interface NotificationInfo {
  _id: string
  userId: string
  type: NotificationTypeEnum
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

/**
 * 创建通知
 * @param data - 通知数据
 * @returns 新创建的通知 ID
 */
export function createNotification(data: {
  userId: string
  type: NotificationTypeEnum
  title: string
  content: string
  targetId?: string
  actorId?: string
}): string | null {
  try {
    // 不给自己发通知
    if (data.actorId && data.userId === data.actorId) {
      return null
    }

    const notificationId = Forum_Notification.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      targetId: data.targetId || '',
      actorId: data.actorId || '',
      isRead: false,
      createdAt: Date.now()
    })

    // 发送 WebSocket 实时通知
    sendNotificationToUser(data.userId, {
      _id: notificationId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      targetId: data.targetId || '',
      actorId: data.actorId || '',
      isRead: false,
      createdAt: Date.now()
    })

    return notificationId
  } catch (err) {
    k.logger.error('NotificationService', `Failed to create notification: ${err}`)
    return null
  }
}

/**
 * 获取用户通知列表
 * @param userId - 用户 ID
 * @param options - 查询选项
 * @returns 通知列表和总数
 */
export function getUserNotifications(
  userId: string,
  options: {
    page?: number
    size?: number
    type?: NotificationTypeEnum
    isRead?: boolean
  } = {}
): { items: NotificationInfo[]; total: number } {
  const page = options.page || 1
  const size = options.size || 20

  // 构建查询条件
  const query: any = { userId }

  if (options.type) {
    query.type = options.type
  }

  if (options.isRead !== undefined) {
    query.isRead = options.isRead
  }

  // 查询所有符合条件的通知
  const allNotifications = Forum_Notification.findAll(
    query,
    {
      order: [{ prop: 'createdAt', order: 'descending' }]
    }
  ) as any[]

  const total = allNotifications.length

  // 分页
  const start = (page - 1) * size
  const end = start + size
  const items = allNotifications.slice(start, end).map(notification => {
    // 获取触发者信息
    let actorName: string | undefined
    let actorAvatar: string | undefined
    if (notification.actorId) {
      const actor = Forum_User.findById(notification.actorId) as any
      if (actor) {
        actorName = actor.displayName || actor.userName
        actorAvatar = actor.avatar
      }
    }

    // 获取关联帖子标题（如果是帖子/回复相关通知）
    let postTitle: string | undefined
    if (notification.targetId && (notification.type === 'reply' || notification.type === 'like_post' || notification.type === 'like_reply' || notification.type === 'best_answer')) {
      const post = Forum_Post.findById(notification.targetId) as any
      if (post) {
        postTitle = post.title
      }
    }

    return {
      _id: notification._id,
      userId: notification.userId,
      type: notification.type as NotificationTypeEnum,
      title: notification.title,
      content: notification.content,
      targetId: notification.targetId || '',
      actorId: notification.actorId || '',
      actorName,
      actorAvatar,
      postTitle,
      isRead: notification.isRead,
      createdAt: notification.createdAt
    }
  })

  return { items, total }
}

/**
 * 获取用户未读通知数量
 * @param userId - 用户 ID
 * @returns 未读通知数量
 */
export function getUnreadCount(userId: string): number {
  try {
    const notifications = Forum_Notification.findAll(
      { userId, isRead: false }
    ) as any[]
    return notifications.length
  } catch (err) {
    k.logger.error('NotificationService', `Failed to get unread count: ${err}`)
    return 0
  }
}

/**
 * 标记通知为已读
 * @param notificationId - 通知 ID
 * @param userId - 用户 ID（用于权限检查）
 * @returns 是否更新成功
 */
export function markAsRead(notificationId: string, userId: string): boolean {
  try {
    const notification = Forum_Notification.findById(notificationId) as any

    if (!notification) {
      return false
    }

    // 检查权限：只能标记自己的通知为已读
    if (notification.userId !== userId) {
      return false
    }

    // 如果已经已读，直接返回成功
    if (notification.isRead) {
      return true
    }

    const updatedId = Forum_Notification.updateById(notificationId, {
      isRead: true
    })

    return updatedId !== null && updatedId !== undefined
  } catch (err) {
    k.logger.error('NotificationService', `Failed to mark as read: ${err}`)
    return false
  }
}

/**
 * 标记用户所有通知为已读
 * @param userId - 用户 ID
 * @returns 更新的通知数量
 */
export function markAllAsRead(userId: string): number {
  try {
    const notifications = Forum_Notification.findAll(
      { userId, isRead: false }
    ) as any[]

    let count = 0
    notifications.forEach(notification => {
      const updatedId = Forum_Notification.updateById(notification._id, {
        isRead: true
      })
      if (updatedId !== null && updatedId !== undefined) {
        count++
      }
    })

    return count
  } catch (err) {
    k.logger.error('NotificationService', `Failed to mark all as read: ${err}`)
    return 0
  }
}

/**
 * 发送通知到用户（通过 WebSocket）
 */
function sendNotificationToUser(userId: string, notification: NotificationInfo): void {
  try {
    const connection = k.net.webSocket.get(userId)
    if (!connection) {
      return // 用户不在线，跳过
    }

    const message = SocketParser.stringify({
      event: 'notification',
      data: notification,
      time: Date.now()
    })

    connection.sendText(message)
    k.logger.information('NotificationService', `Sent notification to user ${userId}`)
  } catch (err) {
    k.logger.error('NotificationService', `Failed to send WebSocket notification: ${err}`)
  }
}

/**
 * 创建回复通知
 * @param postId - 帖子 ID
 * @param replyId - 回复 ID
 * @param postAuthorId - 帖子作者 ID
 * @param replyAuthorId - 回复作者 ID
 * @param replyAuthorName - 回复作者名称
 */
export function createReplyNotification(
  postId: string,
  postAuthorId: string,
  replyAuthorId: string,
  replyAuthorName: string
): void {
  try {
    // 获取帖子标题
    const post = Forum_Post.findById(postId) as any
    const postTitle = post?.title || '帖子'

    createNotification({
      userId: postAuthorId,
      type: 'reply',
      title: '收到新回复',
      content: `${replyAuthorName} 回复了你的帖子「${postTitle}」`,
      targetId: postId,
      actorId: replyAuthorId
    })
  } catch (err) {
    k.logger.error('NotificationService', `Failed to create reply notification: ${err}`)
  }
}

/**
 * 创建帖子被点赞通知
 * @param postId - 帖子 ID
 * @param postAuthorId - 帖子作者 ID
 * @param likeUserId - 点赞用户 ID
 * @param likeUserName - 点赞用户名称
 */
export function createLikePostNotification(
  postId: string,
  postAuthorId: string,
  likeUserId: string,
  likeUserName: string
): void {
  try {
    // 获取帖子标题
    const post = Forum_Post.findById(postId) as any
    const postTitle = post?.title || '帖子'

    createNotification({
      userId: postAuthorId,
      type: 'like_post',
      title: '帖子被点赞',
      content: `${likeUserName} 点赞了你的帖子「${postTitle}」`,
      targetId: postId,
      actorId: likeUserId
    })
  } catch (err) {
    k.logger.error('NotificationService', `Failed to create like post notification: ${err}`)
  }
}

/**
 * 创建评论被点赞通知
 * @param replyId - 评论 ID
 * @param replyAuthorId - 评论作者 ID
 * @param likeUserId - 点赞用户 ID
 * @param likeUserName - 点赞用户名称
 * @param postId - 关联的帖子 ID
 */
export function createLikeReplyNotification(
  replyId: string,
  replyAuthorId: string,
  likeUserId: string,
  likeUserName: string,
  postId: string
): void {
  try {
    createNotification({
      userId: replyAuthorId,
      type: 'like_reply',
      title: '评论被点赞',
      content: `${likeUserName} 点赞了你的评论`,
      targetId: postId,
      actorId: likeUserId
    })
  } catch (err) {
    k.logger.error('NotificationService', `Failed to create like reply notification: ${err}`)
  }
}

/**
 * 创建关注通知
 * @param followUserId - 被关注用户 ID
 * @param followerId - 关注者用户 ID
 * @param followerName - 关注者名称
 */
export function createFollowNotification(
  followUserId: string,
  followerId: string,
  followerName: string
): void {
  try {
    createNotification({
      userId: followUserId,
      type: 'follow',
      title: '新粉丝',
      content: `${followerName} 关注了你`,
      actorId: followerId
    })
  } catch (err) {
    k.logger.error('NotificationService', `Failed to create follow notification: ${err}`)
  }
}

/**
 * 创建最佳答案通知
 * @param postId - 帖子 ID
 * @param postAuthorId - 帖子作者 ID
 * @param replyAuthorId - 回复作者 ID
 * @param replyAuthorName - 回复作者名称
 */
export function createBestAnswerNotification(
  postId: string,
  postAuthorId: string,
  replyAuthorId: string,
  replyAuthorName: string
): void {
  try {
    // 获取帖子标题
    const post = Forum_Post.findById(postId) as any
    const postTitle = post?.title || '帖子'

    createNotification({
      userId: replyAuthorId,
      type: 'best_answer',
      title: '答案被采纳',
      content: `你的回复被采纳为「${postTitle}」的最佳答案`,
      targetId: postId,
      actorId: postAuthorId
    })
  } catch (err) {
    k.logger.error('NotificationService', `Failed to create best answer notification: ${err}`)
  }
}
