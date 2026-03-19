// @k-url /api/forum/admin/category/{action}

import { Forum_Category } from 'code/Models/Forum_Category'
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
 * 获取分类列表
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

        const categories = Forum_Category.findAll({}, {
            order: [{ prop: 'sortOrder', order: 'ASC' }]
        })

        // 格式化返回
        const result = categories.map(cat => ({
            _id: cat._id,
            name: cat.name,
            description: cat.description || '',
            parentId: cat.parentId || '',
            sortOrder: cat.sortOrder || 0,
            showOnHome: cat.showOnHome ?? true,
            isDeleted: (cat as any).isDeleted || false,
            createdAt: (cat as any).createdAt,
            updatedAt: (cat as any).updatedAt
        }))

        return successResponse({ list: result })
    } catch (e: any) {
        return failResponse(e?.message || '获取分类列表失败')
    }
})

/**
 * 创建分类
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
        let body: {
            name?: string
            description?: string
            parentId?: string
            sortOrder?: number
            showOnHome?: boolean
        }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { name, description, parentId, sortOrder, showOnHome } = body

        if (!name || name.trim().length === 0) {
            return failResponse('请输入分类名称')
        }

        // 检查名称唯一性
        const existing = Forum_Category.findOne({ name: name.trim() } as any)
        if (existing) {
            return failResponse('分类名称已存在')
        }

        const categoryId = Forum_Category.create({
            name: name.trim(),
            description: description?.trim() || '',
            parentId: parentId || '',
            sortOrder: sortOrder ?? 0,
            showOnHome: showOnHome ?? true
        })

        if (!categoryId) {
            return failResponse('创建分类失败')
        }

        const category = Forum_Category.findById(categoryId)

        // 记录日志
        logAdminAction({
            action: AdminAction.CATEGORY_CREATE,
            targetType: TargetType.CATEGORY,
            targetId: categoryId,
            detail: { name: category?.name }
        })

        return successResponse({ category })
    } catch (e: any) {
        return failResponse(e?.message || '创建分类失败')
    }
})

/**
 * 更新分类
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
        let body: {
            categoryId?: string
            name?: string
            description?: string
            parentId?: string
            sortOrder?: number
            showOnHome?: boolean
        }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { categoryId, name, description, parentId, sortOrder, showOnHome } = body

        if (!categoryId) {
            return failResponse('缺少分类ID')
        }

        const category = Forum_Category.findById(categoryId)
        if (!category) {
            return failResponse('分类不存在')
        }

        // 检查名称唯一性（排除自己）
        if (name && name.trim() !== category.name) {
            const existing = Forum_Category.findOne({ name: name.trim() } as any)
            if (existing && existing._id !== categoryId) {
                return failResponse('分类名称已存在')
            }
        }

        const updateData: any = {}
        if (name !== undefined) updateData.name = name.trim()
        if (description !== undefined) updateData.description = description?.trim() || ''
        if (parentId !== undefined) updateData.parentId = parentId
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder
        if (showOnHome !== undefined) updateData.showOnHome = showOnHome

        Forum_Category.updateById(categoryId, updateData)

        const updated = Forum_Category.findById(categoryId)

        // 记录日志
        logAdminAction({
            action: AdminAction.CATEGORY_UPDATE,
            targetType: TargetType.CATEGORY,
            targetId: categoryId,
            detail: updateData
        })

        return successResponse({ category: updated })
    } catch (e: any) {
        return failResponse(e?.message || '更新分类失败')
    }
})

/**
 * 删除分类（软删除）
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
        let body: { categoryId?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { categoryId } = body

        if (!categoryId) {
            return failResponse('缺少分类ID')
        }

        const category = Forum_Category.findById(categoryId)
        if (!category) {
            return failResponse('分类不存在')
        }

        // 检查是否有帖子关联
        const postsWithCategory = Forum_Post.findAll({ categoryId } as any)
        const activePosts = postsWithCategory.filter(p => !(p as any).isDeleted)
        if (activePosts.length > 0) {
            return failResponse(`该分类下有 ${activePosts.length} 篇帖子，无法删除`)
        }

        // 软删除
        Forum_Category.deleteById(categoryId)

        // 记录日志
        logAdminAction({
            action: AdminAction.CATEGORY_DELETE,
            targetType: TargetType.CATEGORY,
            targetId: categoryId,
            detail: { name: category.name }
        })

        return successResponse({ success: true, message: '删除成功' })
    } catch (e: any) {
        return failResponse(e?.message || '删除分类失败')
    }
})
