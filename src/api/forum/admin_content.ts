// @k-url /api/forum/admin/content/{action}

import { Forum_Post } from 'code/Models/Forum_Post'
import { Forum_Reply } from 'code/Models/Forum_Reply'
import { Forum_User } from 'code/Models/Forum_User'
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
 * 检查是否为超级管理员
 */
function isSuperAdmin(): boolean {
    const user = getCurrentUser()
    return user?.role === 'superadmin'
}

/**
 * 获取当前用户 ID
 */
function getCurrentUserId(): string | null {
    const user = getCurrentUser()
    return user?._id || null
}

/**
 * 删除帖子（管理员权限）
 * 管理员可删除任何帖子，普通用户只能删除自己的帖子
 */
k.api.post('post/delete', () => {
    try {
        const user = getCurrentUser()
        if (!user) {
            return failResponse('请先登录')
        }

        const bodyStr = k.request.body
        let body: { postId?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { postId } = body
        if (!postId) {
            return failResponse('缺少帖子ID')
        }

        const post = Forum_Post.findById(postId)
        if (!post) {
            return failResponse('帖子不存在')
        }

        // 权限检查：管理员可删除任何帖子，普通用户只能删除自己的帖子
        const canDelete = isAdmin() || post.authorId === user._id
        if (!canDelete) {
            return failResponse('无权限删除此帖子')
        }

        // 软删除帖子
        Forum_Post.deleteById(postId)

        // 级联软删除关联的回复
        const replies = Forum_Reply.findAll({ postId })
        for (const reply of replies) {
            Forum_Reply.deleteById(reply._id)
        }

        return successResponse({ success: true, message: '删除成功' })
    } catch (e: any) {
        return failResponse(e?.message || '删除帖子失败')
    }
})

/**
 * 置顶/取消置顶帖子（仅管理员）
 */
k.api.post('post/pin', () => {
    try {
        const user = getCurrentUser()
        if (!user) {
            return failResponse('请先登录')
        }

        if (!isAdmin()) {
            return failResponse('无权限操作')
        }

        const bodyStr = k.request.body
        let body: { postId?: string; isPinned?: boolean }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { postId, isPinned } = body
        if (!postId) {
            return failResponse('缺少帖子ID')
        }

        const post = Forum_Post.findById(postId)
        if (!post) {
            return failResponse('帖子不存在')
        }

        Forum_Post.updateById(postId, { isPinned: !!isPinned } as any)

        return successResponse({
            success: true,
            message: isPinned ? '置顶成功' : '取消置顶成功'
        })
    } catch (e: any) {
        return failResponse(e?.message || '操作失败')
    }
})

/**
 * 删除回复（管理员权限）
 * 管理员可删除任何回复，普通用户只能删除自己的回复
 */
k.api.post('reply/delete', () => {
    try {
        const user = getCurrentUser()
        if (!user) {
            return failResponse('请先登录')
        }

        const bodyStr = k.request.body
        let body: { replyId?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { replyId } = body
        if (!replyId) {
            return failResponse('缺少回复ID')
        }

        const reply = Forum_Reply.findById(replyId)
        if (!reply) {
            return failResponse('回复不存在')
        }

        // 权限检查：管理员可删除任何回复，普通用户只能删除自己的回复
        const canDelete = isAdmin() || reply.authorId === user._id
        if (!canDelete) {
            return failResponse('无权限删除此回复')
        }

        // 软删除回复
        Forum_Reply.deleteById(replyId)

        // 更新帖子评论数
        const post = Forum_Post.findById(reply.postId)
        if (post && post.replyCount > 0) {
            Forum_Post.updateById(reply.postId, {
                replyCount: post.replyCount - 1
            } as any)
        }

        return successResponse({ success: true, message: '删除成功' })
    } catch (e: any) {
        return failResponse(e?.message || '删除回复失败')
    }
})

/**
 * 获取帖子列表（管理员视角，包含已删除）
 */
k.api.get('post/list', () => {
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

        // 使用原生 SQL 查询帖子（包含软删除的）
        const sql = `
            SELECT p.*, u.userName, u.displayName, u.avatar, u.role as authorRole,
                   c.name as categoryName
            FROM Forum_Post p
            LEFT JOIN Forum_User u ON p.authorId = u._id
            LEFT JOIN Forum_Category c ON p.categoryId = c._id
            ORDER BY p.isPinned DESC, p.createdAt DESC
            LIMIT @limit OFFSET @offset
        `

        // @ts-ignore
        const posts = k.DB.sqlite.query(sql, { limit: pageSize, offset }) as any[]

        // 获取总数
        const countSql = `SELECT COUNT(*) as total FROM Forum_Post`
        const countResult = k.DB.sqlite.query(countSql) as any[]
        const total = countResult[0]?.total || 0

        const formattedPosts = posts.map(post => ({
            _id: post._id,
            title: post.title,
            content: post.content,
            summary: post.summary,
            viewCount: post.viewCount,
            replyCount: post.replyCount,
            likeCount: post.likeCount,
            isPinned: post.isPinned,
            isEdited: post.isEdited,
            editedAt: post.editedAt,
            isDeleted: post.isDeleted,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: {
                _id: post.authorId,
                userName: post.userName,
                displayName: post.displayName,
                avatar: post.avatar,
                role: post.authorRole
            },
            category: post.categoryId ? {
                _id: post.categoryId,
                name: post.categoryName
            } : null
        }))

        return successResponse({
            list: formattedPosts,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        })
    } catch (e: any) {
        return failResponse(e?.message || '获取帖子列表失败')
    }
})

/**
 * 获取回复列表（管理员视角）
 */
k.api.get('reply/list', () => {
    try {
        const user = getCurrentUser()
        if (!user) {
            return failResponse('请先登录')
        }

        if (!isAdmin()) {
            return failResponse('无权限访问')
        }

        const postId = k.request.get('postId')
        const page = parseInt(k.request.get('page') || '1')
        const pageSize = parseInt(k.request.get('pageSize') || '50')
        const offset = (page - 1) * pageSize

        let sql: string
        let params: any

        if (postId) {
            sql = `
                SELECT r.*, u.userName, u.displayName, u.avatar, u.role as authorRole
                FROM Forum_Reply r
                LEFT JOIN Forum_User u ON r.authorId = u._id
                WHERE r.postId = @postId
                ORDER BY r.createdAt ASC
                LIMIT @limit OFFSET @offset
            `
            params = { postId, limit: pageSize, offset }
        } else {
            sql = `
                SELECT r.*, u.userName, u.displayName, u.avatar, u.role as authorRole,
                       p.title as postTitle
                FROM Forum_Reply r
                LEFT JOIN Forum_User u ON r.authorId = u._id
                LEFT JOIN Forum_Post p ON r.postId = p._id
                ORDER BY r.createdAt DESC
                LIMIT @limit OFFSET @offset
            `
            params = { limit: pageSize, offset }
        }

        // @ts-ignore
        const replies = k.DB.sqlite.query(sql, params) as any[]

        // 获取总数
        let countSql: string
        if (postId) {
            countSql = `SELECT COUNT(*) as total FROM Forum_Reply WHERE postId = @postId`
        } else {
            countSql = `SELECT COUNT(*) as total FROM Forum_Reply`
        }
        const countResult = k.DB.sqlite.query(countSql, postId ? { postId } : {}) as any[]
        const total = countResult[0]?.total || 0

        const formattedReplies = replies.map(reply => ({
            _id: reply._id,
            content: reply.content,
            postId: reply.postId,
            parentId: reply.parentId,
            isDeleted: reply.isDeleted,
            createdAt: reply.createdAt,
            updatedAt: reply.updatedAt,
            author: {
                _id: reply.authorId,
                userName: reply.userName,
                displayName: reply.displayName,
                avatar: reply.avatar,
                role: reply.authorRole
            },
            postTitle: reply.postTitle || null
        }))

        return successResponse({
            list: formattedReplies,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        })
    } catch (e: any) {
        return failResponse(e?.message || '获取回复列表失败')
    }
})
