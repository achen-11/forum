/**
 * 管理员操作日志服务
 */
import { Forum_AdminLog } from 'code/Models/Forum_AdminLog'
import { getCurrentUser } from 'code/Services/auth'

/**
 * 记录管理员操作日志
 */
export function logAdminAction(params: {
    action: string
    targetType: string
    targetId: string
    detail?: Record<string, any>
}) {
    const user = getCurrentUser()
    if (!user) {
        console.warn('[AdminLog] No logged in user, cannot log action')
        return
    }

    const { action, targetType, targetId, detail } = params

    Forum_AdminLog.create({
        operatorId: user._id,
        operatorName: user.displayName || user.userName || user._id,
        action,
        targetType,
        targetId,
        detail: detail ? JSON.stringify(detail) : ''
    })
}

// 操作类型枚举
export const AdminAction = {
    // 帖子操作
    POST_DELETE: 'POST_DELETE',
    POST_PIN: 'POST_PIN',
    POST_UNPIN: 'POST_UNPIN',

    // 回复操作
    REPLY_DELETE: 'REPLY_DELETE',

    // 分类操作
    CATEGORY_CREATE: 'CATEGORY_CREATE',
    CATEGORY_UPDATE: 'CATEGORY_UPDATE',
    CATEGORY_DELETE: 'CATEGORY_DELETE',

    // 标签操作
    TAG_CREATE: 'TAG_CREATE',
    TAG_UPDATE: 'TAG_UPDATE',
    TAG_DELETE: 'TAG_DELETE',

    // 用户操作
    USER_ROLE_CHANGE: 'USER_ROLE_CHANGE',
    USER_BAN: 'USER_BAN',
    USER_UNBAN: 'USER_UNBAN',
} as const

// 对象类型枚举
export const TargetType = {
    POST: 'post',
    REPLY: 'reply',
    CATEGORY: 'category',
    TAG: 'tag',
    USER: 'user',
} as const
