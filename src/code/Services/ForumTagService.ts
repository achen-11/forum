import { Forum_Tag } from 'code/Models/Forum_Tag'
import { Forum_Post_Tag } from 'code/Models/Forum_Post_Tag'
import { Forum_Post } from 'code/Models/Forum_Post'

export class ForumTagService {
    /**
     * 获取标签列表（按使用次数排序）
     * @param limit 返回数量限制
     */
    static getTagList(limit: number = 20) {
        const tags = Forum_Tag.findAll({}, {
            order: [{ prop: 'usageCount', order: 'DESC' }],
            limit
        })
        return tags
    }

    /**
     * 创建标签（如果已存在则返回现有标签）
     * @param name 标签名称
     * @param color 标签颜色（可选）
     */
    static createTag(name: string, color?: string) {
        // 查找是否已存在
        const existing = Forum_Tag.findOne({ name })
        if (existing) {
            return existing
        }

        // 创建新标签
        const tagId = Forum_Tag.create({
            name,
            color: color || '#6366f1',
            usageCount: 0
        })

        if (!tagId) {
            throw new Error('创建标签失败')
        }

        return Forum_Tag.findById(tagId)
    }

    /**
     * 为帖子添加标签
     * @param postId 帖子 ID
     * @param tagIds 标签 ID 数组
     */
    static addTagsToPost(postId: string, tagIds: string[]) {
        for (const tagId of tagIds) {
            // 检查是否已关联
            const existing = Forum_Post_Tag.findOne({ postId, tagId })
            if (existing) continue

            // 创建关联
            Forum_Post_Tag.create({ postId, tagId })

            // 增加标签使用次数
            const tag = Forum_Tag.findById(tagId)
            if (tag) {
                Forum_Tag.updateById(tagId, {
                    usageCount: (tag.usageCount || 0) + 1
                })
            }
        }
    }

    /**
     * 移除帖子的所有标签
     * @param postId 帖子 ID
     */
    static removeTagsFromPost(postId: string) {
        const postTags = Forum_Post_Tag.findAll({ postId })

        // 减少标签使用次数
        for (const postTag of postTags) {
            const tag = Forum_Tag.findById(postTag.tagId)
            if (tag && tag.usageCount > 0) {
                Forum_Tag.updateById(postTag.tagId, {
                    usageCount: tag.usageCount - 1
                })
            }
        }

        // 删除关联
        Forum_Post_Tag.deleteMany({ postId })
    }

    /**
     * 获取帖子的标签列表
     * @param postId 帖子 ID
     */
    static getPostTags(postId: string) {
        const postTags = Forum_Post_Tag.findAll({ postId })

        return postTags.map(postTag => {
            const tag = Forum_Tag.findById(postTag.tagId)
            return tag ? {
                _id: tag._id,
                name: tag.name,
                color: tag.color,
                usageCount: tag.usageCount
            } : null
        }).filter(Boolean)
    }

    /**
     * 按标签搜索帖子
     * @param tagId 标签 ID
     * @param page 页码
     * @param pageSize 每页数量
     */
    static searchByTag(tagId: string, page: number = 1, pageSize: number = 10) {
        const pageNum = Math.max(1, page)
        const size = Math.min(50, Math.max(1, pageSize))
        const offset = (pageNum - 1) * size

        // 查找使用该标签的帖子关联
        const postTags = Forum_Post_Tag.findAll({ tagId }, {
            limit: size,
            offset
        })

        // 获取帖子详情
        const posts = postTags.map(pt => {
            const post = Forum_Post.findById(pt.postId)
            return post
        }).filter(Boolean)

        // 获取总数
        const total = Forum_Post_Tag.count({ tagId })

        return {
            list: posts,
            pagination: {
                page: pageNum,
                pageSize: size,
                total,
                totalPages: Math.ceil(total / size)
            }
        }
    }
}
