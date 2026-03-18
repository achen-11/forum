/**
 * 论坛用户服务
 * 包含：关注功能、用户信息获取等
 */
import { Forum_User } from 'code/Models/Forum_User'
import { Forum_Follow } from 'code/Models/Forum_Follow'
import { Forum_Reply } from 'code/Models/Forum_Reply'
import { Forum_Post } from 'code/Models/Forum_Post'
import { validateAuthToken, getCurrentUser } from 'code/Services/auth'

/**
 * 获取当前登录用户 ID（优先从 Authorization header 获取，支持 cookie 回退）
 */
function getCurrentUserId(): string | null {
    const payload = validateAuthToken()
    return payload?.userId || null
}

/**
 * 关注用户
 * @param followingId 被关注的用户 ID
 * @returns { success: boolean, message: string }
 */
export function followUser(followingId: string) {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
        throw new Error('请先登录')
    }

    // 不能关注自己
    if (currentUserId === followingId) {
        throw new Error('不能关注自己')
    }

    // 检查目标用户是否存在
    const targetUser = Forum_User.findById(followingId)
    if (!targetUser) {
        throw new Error('用户不存在')
    }

    // 检查是否已经关注
    const existing = Forum_Follow.findOne({
        followerId: currentUserId,
        followingId
    } as any)
    if (existing) {
        throw new Error('已关注该用户')
    }

    // 创建关注关系
    Forum_Follow.create({
        followerId: currentUserId,
        followingId
    })

    return { success: true, message: '关注成功' }
}

/**
 * 取消关注
 * @param followingId 被取消关注的用户 ID
 * @returns { success: boolean, message: string }
 */
export function unfollowUser(followingId: string) {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
        throw new Error('请先登录')
    }

    // 检查是否已关注
    const existing = Forum_Follow.findOne({
        followerId: currentUserId,
        followingId
    } as any)
    if (!existing) {
        throw new Error('未关注该用户')
    }

    // 删除关注关系
    Forum_Follow.deleteById(existing._id)

    return { success: true, message: '取消关注成功' }
}

/**
 * 获取用户粉丝数量
 * @param userId 用户 ID
 * @returns 粉丝数量
 */
export function getUserFollowersCount(userId: string) {
    const count = Forum_Follow.count({
        followingId: userId
    } as any)
    return count
}

/**
 * 获取用户关注数量
 * @param userId 用户 ID
 * @returns 关注数量
 */
export function getUserFollowingCount(userId: string) {
    const count = Forum_Follow.count({
        followerId: userId
    } as any)
    return count
}

/**
 * 检查当前用户是否已关注目标用户
 * @param followingId 目标用户 ID
 * @returns 是否已关注
 */
export function isFollowing(followingId: string): boolean {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
        return false
    }
    const existing = Forum_Follow.findOne({
        followerId: currentUserId,
        followingId
    } as any)
    return !!existing
}

/**
 * 获取用户的评论列表
 * @param userId 用户 ID
 * @param limit 返回数量限制，默认 20
 * @returns 评论列表
 */
export function getUserComments(userId: string, limit: number = 20) {
    // 获取该用户的所有评论
    const replies = Forum_Reply.findAll(
        { authorId: userId } as any,
        {
            order: [{ prop: 'createdAt', order: 'DESC' }],
            limit
        }
    )

    // 关联查询帖子信息
    return replies.map(reply => {
        let post = null
        if (reply.postId) {
            const postRaw = Forum_Post.findById(reply.postId)
            if (postRaw) {
                post = {
                    _id: postRaw._id,
                    title: postRaw.title
                }
            }
        }
        return {
            _id: reply._id,
            content: reply.content,
            createdAt: reply.createdAt,
            post
        }
    })
}
