// @k-url /api/forum/admin/log/{action}

import { getLogList, getLogStats, requireAdmin } from 'code/Services/AdminLogService'
import { successResponse, failResponse } from 'code/Utils/ResponseUtils'

/**
 * 获取操作日志列表
 */
k.api.get('list', () => {
    try {
        requireAdmin()

        const page = parseInt(k.request.get('page') || '1', 10)
        const pageSize = parseInt(k.request.get('pageSize') || '20', 10)
        const actionType = k.request.get('actionType') || undefined
        const targetType = k.request.get('targetType') || undefined
        const operatorId = k.request.get('operatorId') || undefined

        const result = getLogList({
            page,
            pageSize,
            actionType,
            targetType,
            operatorId
        })

        return successResponse(result)
    } catch (e: any) {
        k.logger.error('[AdminLog] Query error:', e)
        return failResponse(e?.message || '获取日志列表失败')
    }
})

/**
 * 获取操作类型统计
 */
k.api.get('stats', () => {
    try {
        requireAdmin()

        const result = getLogStats()
        return successResponse(result)
    } catch (e: any) {
        return failResponse(e?.message || '获取统计失败')
    }
})