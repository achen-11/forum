import { Forum_Collection } from 'code/Models/Forum_Collection'
import { Forum_Post } from 'code/Models/Forum_Post'
import { getCurrentUser } from 'code/Services/auth'

export class ForumCollectionService {
    /**
     * 获取当前登录用户的 ID
     */
    static getCurrentUserId(): string | null {
        const user = getCurrentUser()
        return user?._id || null
    }

    /**
     * 收藏或取消收藏帖子
     * @param postId 帖子 ID
     * @returns { isCollected: boolean, message: string }
     */
    static toggleCollect(postId: string) {
        const userId = this.getCurrentUserId()
        if (!userId) {
            throw new Error('请先登录')
        }

        // 检查帖子是否存在
        const post = Forum_Post.findById(postId)
        if (!post) {
            throw new Error('帖子不存在')
        }

        // 查询是否已收藏
        const existingCollection = Forum_Collection.findOne({
            userId,
            postId
        })

        if (existingCollection) {
            // 已收藏，执行取消收藏（软删除）
            Forum_Collection.deleteById(existingCollection._id)
            return {
                isCollected: false,
                message: '取消收藏成功'
            }
        } else {
            // 未收藏，执行收藏
            Forum_Collection.create({
                userId,
                postId
            })
            return {
                isCollected: true,
                message: '收藏成功'
            }
        }
    }

    /**
     * 检查当前用户是否收藏了指定帖子
     * @param postId 帖子 ID
     */
    static isCollected(postId: string): boolean {
        const userId = this.getCurrentUserId()
        if (!userId) {
            return false
        }

        const collection = Forum_Collection.findOne({
            userId,
            postId
        })
        return !!collection
    }

    /**
     * 获取当前用户的收藏列表
     * @param page 页码
     * @param pageSize 每页数量
     */
    static getUserCollections(page: number = 1, pageSize: number = 10) {
        const userId = this.getCurrentUserId()
        if (!userId) {
            return { list: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }
        }

        const pageNum = Math.max(1, page)
        const size = Math.min(50, Math.max(1, pageSize))
        const offset = (pageNum - 1) * size

        // 使用原生 SQL 进行分页查询
        const collections = k.DB.sqlite.query(
            `SELECT * FROM Forum_Collection
             WHERE userId = @userId AND isDeleted = 0
             ORDER BY createdAt DESC
             LIMIT @limit OFFSET @offset`,
            { userId, limit: size, offset }
        ) as unknown as Array<{ _id: string; userId: string; postId: string; createdAt: number }>

        // 获取帖子详情（使用原生 SQL 替代 IN 查询）
        const postIds = collections.map(c => c.postId).filter(Boolean)
        let posts: any[] = []
        if (postIds.length > 0) {
            const placeholders = postIds.map((_, i) => `@id${i}`).join(', ')
            const params: Record<string, string> = {}
            postIds.forEach((id, i) => { params[`id${i}`] = id })
            posts = k.DB.sqlite.query(
                `SELECT * FROM Forum_Post WHERE _id IN (${placeholders})`,
                params
            ) as unknown as any[]
        }

        // 构建帖子映射
        const postMap = new Map(posts.map(p => [p._id, p]))

        const list = collections
            .filter(c => postMap.has(c.postId))
            .map(c => {
                const post = postMap.get(c.postId)!
                return {
                    _id: post._id,
                    title: post.title,
                    summary: post.summary,
                    viewCount: post.viewCount,
                    replyCount: post.replyCount,
                    likeCount: post.likeCount,
                    createdAt: post.createdAt,
                    collectedAt: c.createdAt
                }
            })

        // 获取总数
        const total = Forum_Collection.count({ userId })

        return {
            list,
            pagination: {
                page: pageNum,
                pageSize: size,
                total,
                totalPages: Math.ceil(total / size)
            }
        }
    }
}
