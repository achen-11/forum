import { Forum_Post } from 'code/Models/Forum_Post'
import { Forum_Category } from 'code/Models/Forum_Category'
import { Forum_User } from 'code/Models/Forum_User'
import { Forum_Reply } from 'code/Models/Forum_Reply'
import { Forum_Like } from 'code/Models/Forum_Like'
import { Forum_Post_Tag } from 'code/Models/Forum_Post_Tag'
import { getCurrentUser } from 'code/Services/auth'

export class ForumPostService {
    /**
     * 获取当前登录用户的 ID
     */
    static getCurrentUserId(): string | null {
        const user = getCurrentUser()
        return user?._id || null
    }

    /**
     * 获取当前登录用户（包含 role）
     */
    static getCurrentUser() {
        return getCurrentUser()
    }

    /**
     * 检查是否为管理员
     */
    static isAdmin(): boolean {
        const user = getCurrentUser()
        return user?.role === 'admin'
    }

    /**
     * 检查当前用户是否有权限操作目标
     * @param targetAuthorId 目标作者的 ID
     */
    static canManage(targetAuthorId: string): boolean {
        const user = getCurrentUser()
        if (!user) return false
        // 管理员可以管理任何人的内容
        if (user.role === 'admin') return true
        // 普通用户只能管理自己的内容
        return user._id === targetAuthorId
    }

    /**
     * 获取分类列表
     */
    static getCategoryList() {
        const categories = Forum_Category.findAll({}, {
            order: [{ prop: 'sortOrder', order: 'ASC' }]
        })
        return categories
    }

    /**
     * 获取帖子列表
     * @param categoryId 可选的分类 ID
     * @param authorId 可选的作者 ID（用于个人中心「我的帖子」）
     */
    static getPostList(categoryId?: string, authorId?: string) {
        // 构建查询条件
        const where: Record<string, unknown> = {}
        if (categoryId) {
            where.categoryId = categoryId
        }
        if (authorId) {
            where.authorId = authorId
        }

        // 查询帖子
        const posts = Forum_Post.findAll(where, {
            order: [
                { prop: 'isPinned', order: 'DESC' },  // 置顶帖排在前面
                { prop: 'createdAt', order: 'DESC' }  // 然后按时间倒序
            ]
        })

        // 关联查询作者和分类信息
        const postsWithRelations = posts.map(post => {
            // 获取作者信息
            let author = null
            if (post.authorId) {
                author = Forum_User.findOne({ _id: post.authorId })
            }

            // 获取分类信息
            let category = null
            if (post.categoryId) {
                category = Forum_Category.findOne({ _id: post.categoryId })
            }

            return {
                ...post,
                author: author ? {
                    _id: author._id,
                    userName: author.userName,
                    displayName: author.displayName,
                    avatar: author.avatar
                } : null,
                category: category ? {
                    _id: category._id,
                    name: category.name
                } : null
            }
        })

        return postsWithRelations
    }

    /**
     * 创建帖子
     * @param title 帖子标题
     * @param content 帖子内容（HTML）
     * @param categoryId 分类 ID
     * @param authorId 作者 ID
     */
    static createPost(title: string, content: string, categoryId: string, authorId: string) {
        // 生成摘要（取内容纯文本前 100 字）
        const summary = content.replace(/<[^>]*>/g, '').slice(0, 100) + (content.length > 100 ? '...' : '')

        const postId = Forum_Post.create({
            title,
            content,
            summary,
            authorId,
            categoryId,
            viewCount: 0,
            replyCount: 0,
            likeCount: 0,
            isPinned: false
        })

        if (!postId) {
            throw new Error('创建帖子失败')
        }

        return Forum_Post.findById(postId)
    }

    /**
     * 获取帖子详情
     * @param postId 帖子 ID
     */
    static getPostDetail(postId: string) {
        const post = Forum_Post.findById(postId)
        if (!post) {
            throw new Error('帖子不存在')
        }

        // 增加阅读数
        Forum_Post.updateById(postId, {
            viewCount: (post.viewCount || 0) + 1
        })

        // 获取作者信息
        let author = null
        if (post.authorId) {
            author = Forum_User.findOne({ _id: post.authorId })
        }

        // 获取分类信息
        let category = null
        if (post.categoryId) {
            category = Forum_Category.findOne({ _id: post.categoryId })
        }

        return {
            ...post,
            author: author ? {
                _id: author._id,
                userName: author.userName,
                displayName: author.displayName,
                avatar: author.avatar,
                role: author.role || 'user'
            } : null,
            category: category ? {
                _id: category._id,
                name: category.name
            } : null
        }
    }

    /**
     * 创建评论
     * @param postId 帖子 ID
     * @param content 评论内容
     * @param authorId 评论作者 ID
     * @param parentId 父评论 ID（可选，用于回复）
     */
    static createReply(postId: string, content: string, authorId: string, parentId: string = '') {
        const replyId = Forum_Reply.create({
            postId,
            content,
            authorId,
            parentId
        })

        if (!replyId) {
            throw new Error('创建评论失败')
        }

        // 更新帖子评论数
        const post = Forum_Post.findById(postId)
        if (post) {
            Forum_Post.updateById(postId, {
                replyCount: (post.replyCount || 0) + 1
            } as any)
        }

        // 返回带作者信息的评论
        const reply = Forum_Reply.findById(replyId)
        if (!reply) {
            throw new Error('创建评论失败')
        }

        // 获取作者信息
        let author = null
        if (reply.authorId) {
            author = Forum_User.findOne({ _id: reply.authorId })
        }

        return {
            ...reply,
            author: author ? {
                _id: author._id,
                userName: author.userName,
                displayName: author.displayName,
                avatar: author.avatar
            } : null
        }
    }

    /**
     * 获取评论列表
     * @param postId 帖子 ID
     * @param sortOrder 排序方式：ASC（正序）/ DESC（倒序）
     */
    static getReplyList(postId: string, sortOrder: 'ASC' | 'DESC' = 'DESC') {
        const replies = Forum_Reply.findAll({ postId }, {
            order: [{ prop: 'createdAt', order: sortOrder }]
        })

        // 关联查询作者信息
        const repliesWithAuthor = replies.map(reply => {
            let author = null
            if (reply.authorId) {
                author = Forum_User.findOne({ _id: reply.authorId })
            }

            return {
                ...reply,
                author: author ? {
                    _id: author._id,
                    userName: author.userName,
                    displayName: author.displayName,
                    avatar: author.avatar
                } : null
            }
        })

        return repliesWithAuthor
    }

    /**
     * 搜索帖子
     * @param keyword 搜索关键词
     * @param categoryId 可选的分类 ID
     * @param page 页码（从 1 开始）
     * @param pageSize 每页数量
     */
    static searchPosts(keyword: string, categoryId?: string, page: number = 1, pageSize: number = 10) {
        // 参数校验
        const pageNum = Math.max(1, page)
        const size = Math.min(50, Math.max(1, pageSize))
        const offset = (pageNum - 1) * size

        // 构建搜索条件
        let whereClause = ''
        const params: Record<string, unknown> = {
            keyword: `%${keyword}%`,
            offset,
            limit: size
        }

        if (categoryId) {
            whereClause = 'AND p.categoryId = @categoryId'
            params.categoryId = categoryId
        }

        // 使用原生 SQL 进行复杂搜索查询
        // 支持标题和内容模糊匹配，按相关度（匹配次数）和创建时间排序
        const sql = `
            SELECT p.*,
                   (CASE WHEN p.title LIKE @keyword THEN 1 ELSE 0 END +
                    CASE WHEN p.content LIKE @keyword THEN 1 ELSE 0 END) as relevance,
                   u._id as author_id,
                   u.userName as author_userName,
                   u.displayName as author_displayName,
                   u.avatar as author_avatar,
                   c._id as category_id,
                   c.name as category_name
            FROM Forum_Post p
            LEFT JOIN Forum_User u ON p.authorId = u._id
            LEFT JOIN Forum_Category c ON p.categoryId = c._id
            WHERE (p.title LIKE @keyword OR p.content LIKE @keyword)
            ${whereClause}
            AND p.isDeleted = 0
            ORDER BY relevance DESC, p.createdAt DESC
            LIMIT @limit OFFSET @offset
        `
        // @ts-ignore
        const posts = k.DB.sqlite.query(sql, params) as Array<{
            _id: string
            title: string
            content: string
            summary: string
            authorId: string
            categoryId: string
            viewCount: number
            replyCount: number
            likeCount: number
            isPinned: boolean
            relevance: number
            createdAt: string
            updatedAt: string
            author_id: string
            author_userName: string
            author_displayName: string
            author_avatar: string
            category_id: string
            category_name: string
        }>

        // 格式化返回结果
        const result = posts.map(post => ({
            _id: post._id,
            title: post.title,
            content: post.content,
            summary: post.summary,
            viewCount: post.viewCount,
            replyCount: post.replyCount,
            likeCount: post.likeCount,
            isPinned: post.isPinned,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: post.author_id ? {
                _id: post.author_id,
                userName: post.author_userName,
                displayName: post.author_displayName,
                avatar: post.author_avatar
            } : null,
            category: post.category_id ? {
                _id: post.category_id,
                name: post.category_name
            } : null
        }))

        // 获取总数（用于分页）
        let countSql = `
            SELECT COUNT(*) as total
            FROM Forum_Post p
            WHERE (p.title LIKE @keyword OR p.content LIKE @keyword)
            ${whereClause}
            AND p.isDeleted = 0
        `
        const countResult = k.DB.sqlite.query(countSql, params) as unknown as Array<{ total: number }>
        const total = countResult[0]?.total || 0

        return {
            list: result,
            pagination: {
                page: pageNum,
                pageSize: size,
                total,
                totalPages: Math.ceil(total / size)
            }
        }
    }

    /**
     * 点赞或取消点赞帖子/评论
     * @param targetType 目标类型：post / reply
     * @param targetId 目标 ID
     * @returns { isLiked: boolean, likeCount: number, message: string }
     */
    static toggleLike(targetType: string, targetId: string) {
        const userId = this.getCurrentUserId()
        if (!userId) {
            throw new Error('请先登录')
        }

        // 查询是否已点赞
        const existingLike = Forum_Like.findOne({
            userId,
            targetType,
            targetId
        })

        if (existingLike) {
            // 已点赞，执行取消点赞
            Forum_Like.deleteById(existingLike._id)

            // 更新目标点赞数
            if (targetType === 'post') {
                const post = Forum_Post.findById(targetId)
                if (post) {
                    Forum_Post.updateById(targetId, {
                        likeCount: Math.max(0, (post.likeCount || 1) - 1)
                    } as any)
                }
            }
            // reply 也类似处理（如果需要）

            // 获取最新点赞数
            const post = targetType === 'post' ? Forum_Post.findById(targetId) : null
            return {
                isLiked: false,
                likeCount: post?.likeCount || 0,
                message: '取消点赞成功'
            }
        } else {
            // 未点赞，执行点赞
            Forum_Like.create({
                userId,
                targetType,
                targetId
            })

            // 更新目标点赞数
            if (targetType === 'post') {
                const post = Forum_Post.findById(targetId)
                if (post) {
                    Forum_Post.updateById(targetId, {
                        likeCount: (post.likeCount || 0) + 1
                    } as any)
                }
            }
            // reply 也类似处理（如果需要）

            // 获取最新点赞数
            const post = targetType === 'post' ? Forum_Post.findById(targetId) : null
            return {
                isLiked: true,
                likeCount: post?.likeCount || 0,
                message: '点赞成功'
            }
        }
    }

    /**
     * 检查当前用户是否点赞了指定目标
     * @param targetType 目标类型：post / reply
     * @param targetId 目标 ID
     */
    static isLiked(targetType: string, targetId: string): boolean {
        const userId = this.getCurrentUserId()
        if (!userId) {
            return false
        }

        const like = Forum_Like.findOne({
            userId,
            targetType,
            targetId
        })
        return !!like
    }

    /**
     * 增加分享次数
     * @param postId 帖子 ID
     * @returns { shareCount: number }
     */
    static incrementShareCount(postId: string) {
        const post = Forum_Post.findById(postId)
        if (!post) {
            throw new Error('帖子不存在')
        }

        const newCount = (post.shareCount || 0) + 1
        Forum_Post.updateById(postId, {
            shareCount: newCount
        } as any)

        return { shareCount: newCount }
    }

    /**
     * 获取相关帖子
     * @param postId 当前帖子 ID
     * @param limit 返回数量限制
     */
    static getRelatedPosts(postId: string, limit: number = 5) {
        const currentPost = Forum_Post.findById(postId)
        if (!currentPost) {
            return []
        }

        // 获取当前帖子的标签
        const postTags = Forum_Post_Tag.findAll({ postId })
        const tagIds = postTags.map(pt => pt.tagId)

        // 查询条件：同分类 或 同标签（排除当前帖子）
        let relatedPosts: any[] = []

        if (currentPost.categoryId) {
            // 使用原生 SQL 查询同分类的帖子
            const sql = `
                SELECT p.* FROM Forum_Post p
                WHERE p.categoryId = @categoryId AND p._id != @postId AND p.isDeleted = 0
                ORDER BY p.viewCount DESC
            `
            const sameCategoryPosts = k.DB.sqlite.query(sql, {
                categoryId: currentPost.categoryId,
                postId
            }) as any[]
            relatedPosts = [...relatedPosts, ...sameCategoryPosts]
        }

        if (tagIds.length > 0) {
            // 查询同标签的帖子
            const tagPlaceholders = tagIds.map((_, i) => `@tag${i}`).join(', ')
            const tagParams: Record<string, string> = { postId }
            tagIds.forEach((tagId, i) => {
                tagParams[`tag${i}`] = tagId
            })

            const sql = `
                SELECT DISTINCT p.* FROM Forum_Post p
                INNER JOIN Forum_Post_Tag pt ON p._id = pt.postId
                WHERE pt.tagId IN (${tagPlaceholders}) AND p._id != @postId AND p.isDeleted = 0
                ORDER BY p.viewCount DESC
            `
            const sameTagPosts = k.DB.sqlite.query(sql, tagParams) as any[]
            relatedPosts = [...relatedPosts, ...sameTagPosts]
        }

        // 去重、排序并限制数量
        const seen = new Set<string>()
        const deduplicatedPosts = relatedPosts
            .filter(post => {
                if (seen.has(post._id)) return false
                seen.add(post._id)
                return true
            })
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
            .slice(0, limit)

        return deduplicatedPosts.slice(0, limit).map(post => {
            // 获取作者信息
            let author = null
            if (post.authorId) {
                author = Forum_User.findOne({ _id: post.authorId })
            }

            // 获取分类信息
            let category = null
            if (post.categoryId) {
                category = Forum_Category.findOne({ _id: post.categoryId })
            }

            return {
                _id: post._id,
                title: post.title,
                summary: post.summary,
                viewCount: post.viewCount,
                replyCount: post.replyCount,
                likeCount: post.likeCount,
                createdAt: post.createdAt,
                author: author ? {
                    _id: author._id,
                    userName: author.userName,
                    displayName: author.displayName,
                    avatar: author.avatar
                } : null,
                category: category ? {
                    _id: category._id,
                    name: category.name
                } : null
            }
        })
    }

    /**
     * 编辑帖子
     * @param postId 帖子 ID
     * @param title 新标题
     * @param content 新内容
     * @returns 更新后的帖子
     */
    static editPost(postId: string, title: string, content: string) {
        const user = getCurrentUser()
        if (!user) {
            throw new Error('请先登录')
        }

        const post = Forum_Post.findById(postId)
        if (!post) {
            throw new Error('帖子不存在')
        }

        // 权限检查：管理员可编辑任何帖子，普通用户只能编辑自己的帖子
        if (!this.canManage(post.authorId)) {
            throw new Error('无权限编辑此帖子')
        }

        // 生成新摘要
        const summary = content.replace(/<[^>]*>/g, '').slice(0, 100) + (content.length > 100 ? '...' : '')

        // 更新帖子
        Forum_Post.updateById(postId, {
            title,
            content,
            summary,
            isEdited: true,
            editedAt: Date.now()
        } as any)

        return this.getPostDetail(postId)
    }

    /**
     * 删除帖子
     * @param postId 帖子 ID
     */
    static deletePost(postId: string) {
        const user = getCurrentUser()
        if (!user) {
            throw new Error('请先登录')
        }

        const post = Forum_Post.findById(postId)
        if (!post) {
            throw new Error('帖子不存在')
        }

        // 权限检查：管理员可删除任何帖子，普通用户只能删除自己的帖子
        if (!this.canManage(post.authorId)) {
            throw new Error('无权限删除此帖子')
        }

        // 软删除帖子
        Forum_Post.deleteById(postId)

        // 级联删除关联的回复（软删除）
        const replies = Forum_Reply.findAll({ postId })
        for (const reply of replies) {
            Forum_Reply.deleteById(reply._id)
        }

        // 删除关联的点赞
        const likes = Forum_Like.findAll({ targetType: 'post', targetId: postId })
        for (const like of likes) {
            Forum_Like.deleteById(like._id)
        }

        return { success: true, message: '删除成功' }
    }

    /**
     * 删除回复
     * @param replyId 回复 ID
     */
    static deleteReply(replyId: string) {
        const user = getCurrentUser()
        if (!user) {
            throw new Error('请先登录')
        }

        const reply = Forum_Reply.findById(replyId)
        if (!reply) {
            throw new Error('回复不存在')
        }

        // 权限检查：管理员可删除任何回复，普通用户只能删除自己的回复
        if (!this.canManage(reply.authorId)) {
            throw new Error('无权限删除此回复')
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

        // 删除关联的点赞
        const likes = Forum_Like.findAll({ targetType: 'reply', targetId: replyId })
        for (const like of likes) {
            Forum_Like.deleteById(like._id)
        }

        return { success: true, message: '删除成功' }
    }

    /**
     * 获取嵌套的回复列表
     * @param postId 帖子 ID
     * @param sortOrder 排序方式：ASC（正序）/ DESC（倒序）
     */
    static getNestedReplyList(postId: string, sortOrder: 'ASC' | 'DESC' = 'DESC') {
        const replies = Forum_Reply.findAll({ postId }, {
            order: [{ prop: 'createdAt', order: sortOrder }]
        })

        // 关联查询作者信息
        const repliesWithAuthor = replies.map(reply => {
            let author = null
            if (reply.authorId) {
                author = Forum_User.findOne({ _id: reply.authorId })
            }

            // 获取被回复者信息
            let parentReply = null
            if (reply.parentId) {
                parentReply = Forum_Reply.findById(reply.parentId)
            }

            return {
                ...reply,
                author: author ? {
                    _id: author._id,
                    userName: author.userName,
                    displayName: author.displayName,
                    avatar: author.avatar,
                    role: author.role || 'user'
                } : null,
                parentReply: parentReply ? {
                    _id: parentReply._id,
                    authorId: parentReply.authorId
                } : null
            }
        })

        // 构建嵌套结构
        // 一级回复（parentId 为空）
        const topLevelReplies = repliesWithAuthor.filter(r => !r.parentId)
        // 二级回复（parentId 不为空）
        const childReplies = repliesWithAuthor.filter(r => r.parentId)

        // 为每个一级回复添加 children
        return topLevelReplies.map(reply => {
            const children = childReplies.filter(r => r.parentId === reply._id)
            return {
                ...reply,
                children: children.map(child => {
                    // 查找被回复者的显示名称
                    const parentAuthor = child.parentReply
                        ? Forum_User.findOne({ _id: child.parentReply.authorId })
                        : null
                    return {
                        ...child,
                        replyTo: parentAuthor ? {
                            _id: parentAuthor._id,
                            displayName: parentAuthor.displayName,
                            userName: parentAuthor.userName
                        } : null
                    }
                })
            }
        })
    }
}
