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
}
