// @k-url /api/forum/admin/user/{action}

import { Forum_User } from 'code/Models/Forum_User'
import { getCurrentUser } from 'code/Services/auth'
import { successResponse, failResponse } from 'code/Utils/ResponseUtils'

/**
 * 检查是否为超级管理员
 */
function isSuperAdmin(): boolean {
    const user = getCurrentUser()
    return user?.role === 'superadmin'
}

/**
 * 检查是否为管理员（admin 或 superadmin）
 */
function isAdmin(): boolean {
    const user = getCurrentUser()
    return user?.role === 'admin' || user?.role === 'superadmin'
}

/**
 * 获取用户列表
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

        const keyword = k.request.get('keyword') || ''
        const page = parseInt(k.request.get('page') || '1')
        const pageSize = parseInt(k.request.get('pageSize') || '20')
        const offset = (page - 1) * pageSize

        const params: any = {
            limit: pageSize,
            offset: offset,
            keyword: keyword ? `%${keyword}%` : null
        }

        // 根据是否有 keyword 选择不同的查询
        let users: any[]
        let total: number

        if (keyword) {
            // @ts-ignore
            users = k.DB.sqlite.query(`
                SELECT u._id, u.userName, u.displayName, u.email, u.phone, u.avatar,
                       u.role, u.isBanned, u.createdAt, u.lastLoginAt
                FROM Forum_User u
                WHERE u.userName LIKE @keyword OR u.displayName LIKE @keyword OR u.email LIKE @keyword OR u.phone LIKE @keyword
                ORDER BY u.createdAt DESC
                LIMIT @limit OFFSET @offset
            `, params) as any[]

            // @ts-ignore
            const countResult = k.DB.sqlite.query(`
                SELECT COUNT(*) as total FROM Forum_User u
                WHERE u.userName LIKE @keyword OR u.displayName LIKE @keyword OR u.email LIKE @keyword OR u.phone LIKE @keyword
            `, { keyword: `%${keyword}%` }) as any[]
            total = countResult[0]?.total || 0
        } else {
            // @ts-ignore
            users = k.DB.sqlite.query(`
                SELECT u._id, u.userName, u.displayName, u.email, u.phone, u.avatar,
                       u.role, u.isBanned, u.createdAt, u.lastLoginAt
                FROM Forum_User u
                ORDER BY u.createdAt DESC
                LIMIT @limit OFFSET @offset
            `, params) as any[]

            // @ts-ignore
            const countResult = k.DB.sqlite.query(`SELECT COUNT(*) as total FROM Forum_User u`, {}) as any[]
            total = countResult[0]?.total || 0
        }

        // 格式化返回
        const result = users.map(u => ({
            _id: u._id,
            userName: u.userName || '',
            displayName: u.displayName || '',
            email: u.email || '',
            phone: u.phone || '',
            avatar: u.avatar || '',
            role: u.role || 'user',
            isBanned: !!u.isBanned,
            createdAt: u.createdAt,
            lastLoginAt: u.lastLoginAt
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
        return failResponse(e?.message || '获取用户列表失败')
    }
})

/**
 * 变更用户角色
 */
k.api.post('role', () => {
    try {
        const currentUser = getCurrentUser()
        if (!currentUser) {
            return failResponse('请先登录')
        }

        // 只有超级管理员可以变更角色
        if (!isSuperAdmin()) {
            return failResponse('只有超级管理员可以变更用户角色')
        }

        const bodyStr = k.request.body
        let body: { userId?: string; role?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { userId, role } = body

        if (!userId) {
            return failResponse('缺少用户ID')
        }

        if (!role || !['user', 'admin'].includes(role)) {
            return failResponse('无效的角色')
        }

        // 不能修改自己的角色
        if (userId === currentUser._id) {
            return failResponse('不能修改自己的角色')
        }

        // 查找目标用户
        const targetUser = Forum_User.findById(userId)
        if (!targetUser) {
            return failResponse('用户不存在')
        }

        // 不能修改超级管理员的角色
        if ((targetUser as any).role === 'superadmin') {
            return failResponse('不能修改超级管理员的角色')
        }

        // 不能将普通用户提升为超级管理员
        if (role === 'superadmin') {
            return failResponse('不能将用户提升为超级管理员')
        }

        Forum_User.updateById(userId, { role } as any)

        return successResponse({ success: true, message: '角色变更成功' })
    } catch (e: any) {
        return failResponse(e?.message || '变更角色失败')
    }
})

/**
 * 封禁用户
 */
k.api.post('ban', () => {
    try {
        const currentUser = getCurrentUser()
        if (!currentUser) {
            return failResponse('请先登录')
        }

        if (!isAdmin()) {
            return failResponse('无权限访问')
        }

        const bodyStr = k.request.body
        let body: { userId?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { userId } = body

        if (!userId) {
            return failResponse('缺少用户ID')
        }

        // 不能封禁自己
        if (userId === currentUser._id) {
            return failResponse('不能封禁自己')
        }

        // 查找目标用户
        const targetUser = Forum_User.findById(userId)
        if (!targetUser) {
            return failResponse('用户不存在')
        }

        // 不能封禁超级管理员
        if ((targetUser as any).role === 'superadmin') {
            return failResponse('不能封禁超级管理员')
        }

        // 不能封禁管理员（除非是超级管理员）
        if ((targetUser as any).role === 'admin' && !isSuperAdmin()) {
            return failResponse('只有超级管理员可以封禁管理员')
        }

        Forum_User.updateById(userId, { isBanned: true } as any)

        return successResponse({ success: true, message: '封禁成功' })
    } catch (e: any) {
        return failResponse(e?.message || '封禁失败')
    }
})

/**
 * 解封用户
 */
k.api.post('unban', () => {
    try {
        const currentUser = getCurrentUser()
        if (!currentUser) {
            return failResponse('请先登录')
        }

        if (!isAdmin()) {
            return failResponse('无权限访问')
        }

        const bodyStr = k.request.body
        let body: { userId?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { userId } = body

        if (!userId) {
            return failResponse('缺少用户ID')
        }

        // 查找目标用户
        const targetUser = Forum_User.findById(userId)
        if (!targetUser) {
            return failResponse('用户不存在')
        }

        Forum_User.updateById(userId, { isBanned: false } as any)

        return successResponse({ success: true, message: '解封成功' })
    } catch (e: any) {
        return failResponse(e?.message || '解封失败')
    }
})
