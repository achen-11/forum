/**
 * 管理员操作日志服务
 */
import { Forum_AdminLog } from 'code/Models/Forum_AdminLog'
import { getCurrentUser } from 'code/Services/auth'

/**
 * 管理员操作类型
 */
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
export type AdminAction = typeof AdminAction[keyof typeof AdminAction]

/**
 * 操作对象类型
 */
export const TargetType = {
    POST: 'post',
    REPLY: 'reply',
    CATEGORY: 'category',
    TAG: 'tag',
    USER: 'user',
} as const
export type TargetType = typeof TargetType[keyof typeof TargetType]

/**
 * 记录管理员操作日志
 */
export function logAdminAction(params: {
    action: AdminAction
    targetType: TargetType
    targetId: string
    detail?: Record<string, any>
}) {
    const user = getCurrentUser()
    if (!user) {
        k.logger.warning('[AdminLog] No logged in user, cannot log action')
        return
    }

    try {
        Forum_AdminLog.create({
            operatorId: user._id,
            operatorName: user.displayName || user.userName || 'Unknown',
            action: params.action,
            targetType: params.targetType,
            targetId: params.targetId,
            detail: params.detail ? JSON.stringify(params.detail) : null
        })
    } catch (e: any) {
        k.logger.error('[AdminLog] Failed to log admin action:', e)
    }
}

/**
 * 获取操作日志列表
 */
export function getLogList(params: {
    page: number
    pageSize: number
    actionType?: string
    targetType?: string
    operatorId?: string
}) {
    const { page, pageSize, actionType, targetType, operatorId } = params
    const offset = (page - 1) * pageSize

    // 构建查询条件
    const conditions: string[] = []
    const queryParams: any = {}

    if (actionType) {
        conditions.push(`a.action = @actionType`)
        queryParams.actionType = actionType
    }
    if (targetType) {
        conditions.push(`a.targetType = @targetType`)
        queryParams.targetType = targetType
    }
    if (operatorId) {
        conditions.push(`a.operatorId = @operatorId`)
        queryParams.operatorId = operatorId
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // 查询日志列表
    // @ts-ignore
    const logs = k.DB.sqlite.query(`
        SELECT a.*, u.displayName as operatorDisplayName
        FROM Forum_AdminLog a
        LEFT JOIN Forum_User u ON a.operatorId = u._id
        ${whereClause}
        ORDER BY a.createdAt DESC
        LIMIT @limit OFFSET @offset
    `, { ...queryParams, limit: pageSize, offset }) as any[]

    // 获取总数
    // @ts-ignore
    const countResult = k.DB.sqlite.query(`
        SELECT COUNT(*) as total FROM Forum_AdminLog a
        ${whereClause}
    `, queryParams) as any[]
    const total = countResult[0]?.total || 0

    // 格式化返回
    const result = logs.map(log => ({
        _id: log._id,
        operatorId: log.operatorId,
        operatorName: log.operatorDisplayName || log.operatorName,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        detail: log.detail ? JSON.parse(log.detail) : null,
        createdAt: log.createdAt
    }))

    return {
        list: result,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    }
}

/**
 * 获取操作类型统计
 */
export function getLogStats() {
    // @ts-ignore
    const stats = k.DB.sqlite.query(`
        SELECT action, COUNT(*) as count
        FROM Forum_AdminLog
        GROUP BY action
        ORDER BY count DESC
    `, {}) as any[]

    return {
        stats: stats.map(s => ({
            action: s.action,
            count: s.count
        }))
    }
}

/**
 * 检查是否有管理员权限
 */
export function requireAdmin() {
    const user = getCurrentUser()
    if (!user) {
        throw new Error('请先登录')
    }
    if (user.role !== 'admin' && user.role !== 'superadmin') {
        throw new Error('无权限访问')
    }
    return user
}
