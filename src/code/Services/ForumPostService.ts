import { Forum_Post } from 'code/Models/Forum_Post'
import { Forum_Category } from 'code/Models/Forum_Category'
import { Forum_User } from 'code/Models/Forum_User'

export class ForumPostService {
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
     */
    static getPostList(categoryId?: string) {
        // 构建查询条件
        const where: Record<string, unknown> = {}
        if (categoryId) {
            where.categoryId = categoryId
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
}
