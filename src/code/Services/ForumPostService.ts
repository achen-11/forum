import { Forum_Post } from 'code/Models/Forum_Post'
import { Forum_Category } from 'code/Models/Forum_Category'
import { Forum_User } from 'code/Models/Forum_User'
import { Forum_Reply } from 'code/Models/Forum_Reply'
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
                avatar: author.avatar
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
        const countResult = k.DB.sqlite.query(countSql, params) as Array<{ total: number }>
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
}
