// @k-url /api/forum/admin/log/{action}

import { Forum_AdminLog } from 'code/Models/Forum_AdminLog'
import { getCurrentUser } from 'code/Services/auth'
import { successResponse, failResponse } from 'code/Utils/ResponseUtils'

/**
 * 检查是否为管理员（admin 或 superadmin）
 */
function isAdmin(): boolean {
    const user = getCurrentUser()
    return user?.role === 'admin' || user?.role === 'superadmin'
}

/**
 * 获取操作日志列表
 */
k.api.get('list', () => {
    try {
        const user = getCurrentUser()
        if (!user) {
            return failResponse('请先登录')
        }

        if (!isAdmin()) {
            return failResponse('无权限访问')
        }

        const page = parseInt(k.request.get('page') || '1')
        const pageSize = parseInt(k.request.get('pageSize') || '20')
        const offset = (page - 1) * pageSize

        const action = k.request.get('action') || ''
        const targetType = k.request.get('targetType') || ''
        const operatorId = k.request.get('operatorId') || ''

        // 构建查询条件
        const conditions: string[] = []
        const params: any = {
            limit: pageSize,
            offset: offset
        }

        if (action) {
            conditions.push(`a.action = @action`)
            params.action = action
        }
        if (targetType) {
            conditions.push(`a.targetType = @targetType`)
            params.targetType = targetType
        }
        if (operatorId) {
            conditions.push(`a.operatorId = @operatorId`)
            params.operatorId = operatorId
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
        `, params) as any[]

        // 获取总数
        // @ts-ignore
        const countResult = k.DB.sqlite.query(`
            SELECT COUNT(*) as total FROM Forum_AdminLog a
            ${whereClause}
        `, params) as any[]
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

        return successResponse({
            list: result,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        })
    } catch (e: any) {
        console.error('[AdminLog] Query error:', e)
        return failResponse(e?.message || '获取日志列表失败')
    }
})

/**
 * 获取操作类型统计
 */
k.api.get('stats', () => {
    try {
        const user = getCurrentUser()
        if (!user) {
            return failResponse('请先登录')
        }

        if (!isAdmin()) {
            return failResponse('无权限访问')
        }

        // @ts-ignore
        const stats = k.DB.sqlite.query(`
            SELECT action, COUNT(*) as count
            FROM Forum_AdminLog
            GROUP BY action
            ORDER BY count DESC
        `, {}) as any[]

        return successResponse({
            stats: stats.map(s => ({
                action: s.action,
                count: s.count
            }))
        })
    } catch (e: any) {
        return failResponse(e?.message || '获取统计失败')
    }
})
