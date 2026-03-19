// @k-url /api/forum/admin/tag/{action}

import { Forum_Tag } from 'code/Models/Forum_Tag'
import { Forum_Post_Tag } from 'code/Models/Forum_Post_Tag'
import { Forum_Post } from 'code/Models/Forum_Post'
import { getCurrentUser } from 'code/Services/auth'
import { successResponse, failResponse } from 'code/Utils/ResponseUtils'
import { logAdminAction, AdminAction, TargetType } from 'code/Services/AdminLogService'

/**
 * 检查是否为管理员（admin 或 superadmin）
 */
function isAdmin(): boolean {
    const user = getCurrentUser()
    return user?.role === 'admin' || user?.role === 'superadmin'
}

/**
 * 获取标签列表
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

        const tags = Forum_Tag.findAll({}, {
            order: [{ prop: 'usageCount', order: 'DESC' }]
        })

        // 格式化返回
        const result = tags.map(tag => ({
            _id: tag._id,
            name: tag.name,
            color: tag.color || '#6366f1',
            usageCount: tag.usageCount || 0,
            isDeleted: (tag as any).isDeleted || false,
            createdAt: (tag as any).createdAt,
            updatedAt: (tag as any).updatedAt
        }))

        return successResponse({ list: result })
    } catch (e: any) {
        return failResponse(e?.message || '获取标签列表失败')
    }
})

/**
 * 创建标签
 */
k.api.post('create', () => {
    try {
        const user = getCurrentUser()
        if (!user) {
            return failResponse('请先登录')
        }

        if (!isAdmin()) {
            return failResponse('无权限访问')
        }

        const bodyStr = k.request.body
        let body: { name?: string; color?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { name, color } = body

        if (!name || name.trim().length === 0) {
            return failResponse('请输入标签名称')
        }

        // 检查名称唯一性
        const existing = Forum_Tag.findOne({ name: name.trim() } as any)
        if (existing) {
            return failResponse('标签名称已存在')
        }

        const tagId = Forum_Tag.create({
            name: name.trim(),
            color: color || '#6366f1',
            usageCount: 0
        })

        if (!tagId) {
            return failResponse('创建标签失败')
        }

        const tag = Forum_Tag.findById(tagId)

        // 记录日志
        logAdminAction({
            action: AdminAction.TAG_CREATE,
            targetType: TargetType.TAG,
            targetId: tagId,
            detail: { name: tag?.name, color: tag?.color }
        })

        return successResponse({ tag })
    } catch (e: any) {
        return failResponse(e?.message || '创建标签失败')
    }
})

/**
 * 更新标签
 */
k.api.post('update', () => {
    try {
        const user = getCurrentUser()
        if (!user) {
            return failResponse('请先登录')
        }

        if (!isAdmin()) {
            return failResponse('无权限访问')
        }

        const bodyStr = k.request.body
        let body: { tagId?: string; name?: string; color?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { tagId, name, color } = body

        if (!tagId) {
            return failResponse('缺少标签ID')
        }

        const tag = Forum_Tag.findById(tagId)
        if (!tag) {
            return failResponse('标签不存在')
        }

        // 检查名称唯一性（排除自己）
        if (name && name.trim() !== tag.name) {
            const existing = Forum_Tag.findOne({ name: name.trim() } as any)
            if (existing && existing._id !== tagId) {
                return failResponse('标签名称已存在')
            }
        }

        const updateData: any = {}
        if (name !== undefined) updateData.name = name.trim()
        if (color !== undefined) updateData.color = color

        Forum_Tag.updateById(tagId, updateData)

        const updated = Forum_Tag.findById(tagId)

        // 记录日志
        logAdminAction({
            action: AdminAction.TAG_UPDATE,
            targetType: TargetType.TAG,
            targetId: tagId,
            detail: updateData
        })

        return successResponse({ tag: updated })
    } catch (e: any) {
        return failResponse(e?.message || '更新标签失败')
    }
})

/**
 * 删除标签（软删除）
 */
k.api.post('delete', () => {
    try {
        const user = getCurrentUser()
        if (!user) {
            return failResponse('请先登录')
        }

        if (!isAdmin()) {
            return failResponse('无权限访问')
        }

        const bodyStr = k.request.body
        let body: { tagId?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { tagId } = body

        if (!tagId) {
            return failResponse('缺少标签ID')
        }

        const tag = Forum_Tag.findById(tagId)
        if (!tag) {
            return failResponse('标签不存在')
        }

        // 检查是否有帖子关联
        const postTags = Forum_Post_Tag.findAll({ tagId } as any)
        if (postTags.length > 0) {
            return failResponse(`该标签被 ${postTags.length} 篇帖子使用，无法删除`)
        }

        // 软删除
        Forum_Tag.deleteById(tagId)

        // 记录日志
        logAdminAction({
            action: AdminAction.TAG_DELETE,
            targetType: TargetType.TAG,
            targetId: tagId,
            detail: { name: tag.name }
        })

        return successResponse({ success: true, message: '删除成功' })
    } catch (e: any) {
        return failResponse(e?.message || '删除标签失败')
    }
})
