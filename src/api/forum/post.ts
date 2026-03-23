// @k-url /api/forum/post/{action}

import { ForumPostService } from 'code/Services/ForumPostService'
import { ForumTagService } from 'code/Services/ForumTagService'
import { ForumCollectionService } from 'code/Services/ForumCollectionService'
import { Forum_Category } from 'code/Models/Forum_Category'
import { Forum_Post } from 'code/Models/Forum_Post'
import { Forum_User } from 'code/Models/Forum_User'
import { Forum_Reply } from 'code/Models/Forum_Reply'
import { successResponse, failResponse } from 'code/Utils/ResponseUtils'

/**
 * 获取分类列表
 */
k.api.get('categories', () => {
    try {
        const categories = ForumPostService.getCategoryList()
        return successResponse({ categories })
    } catch (e: any) {
        return failResponse(e?.message || '获取分类列表失败')
    }
})

/**
 * 获取帖子列表
 * 支持 categoryId、authorId 参数筛选（authorId 用于个人中心「我的帖子」）
 * 支持分页参数 page、pageSize
 */
k.api.get('list', () => {
    try {
        const categoryId = k.request.get('categoryId') || undefined
        const authorId = k.request.get('authorId') || undefined
        const page = parseInt(k.request.get('page') || '1', 10)
        const pageSize = parseInt(k.request.get('pageSize') || '10', 10)
        const result = ForumPostService.getPostList(categoryId, authorId, page, pageSize)
        return successResponse(result)
    } catch (e: any) {
        return failResponse(e?.message || '获取帖子列表失败')
    }
})

/**
 * 生成测试数据（Mock Data）
 */
k.api.get('seed', () => {
    try {
        // 创建测试用户
        let user1 = Forum_User.findOne({ userName: 'testuser1' })
        if (!user1) {
            const user1Id = Forum_User.create({
                userName: 'testuser1',
                password: k.security.md5('123456'),
                displayName: '测试用户1',
                avatar: ''
            })
            user1 = Forum_User.findById(user1Id)
        }

        let user2 = Forum_User.findOne({ userName: 'testuser2' })
        if (!user2) {
            const user2Id = Forum_User.create({
                userName: 'testuser2',
                password: k.security.md5('123456'),
                displayName: '测试用户2',
                avatar: ''
            })
            user2 = Forum_User.findById(user2Id)
        }

        // 创建测试分类
        const categoryNames = [
            { name: '技术讨论', description: '技术相关话题' },
            { name: '生活分享', description: '日常生活分享' },
            { name: '问答求助', description: '问题解答和求助' },
            { name: '资源共享', description: '资源分享和推荐' }
        ]

        const categories: Array<{ _id: string; name: string }> = []
        for (let i = 0; i < categoryNames.length; i++) {
            const cat = categoryNames[i]
            let existing = Forum_Category.findOne({ name: cat.name })
            if (!existing) {
                const id = Forum_Category.create({
                    name: cat.name,
                    description: cat.description,
                    sortOrder: i + 1
                })
                existing = Forum_Category.findById(id)
            }
            if (existing) {
                categories.push({ _id: existing._id, name: existing.name })
            }
        }

        if (categories.length === 0 || !user1 || !user2) {
            return failResponse('创建测试数据失败')
        }

        // 创建测试标签
        const tagData = [
            { name: 'React', color: '#61dafb' },
            { name: 'Vue', color: '#42b883' },
            { name: 'TypeScript', color: '#3178c6' },
            { name: '前端', color: '#ff6b6b' },
            { name: '后端', color: '#4ecdc4' },
            { name: 'Kooboo', color: '#7c3aed' }
        ]

        const tags: Array<{ _id: string; name: string }> = []
        for (const tagInfo of tagData) {
            const tag = ForumTagService.createTag(tagInfo.name, tagInfo.color)
            if (tag) {
                tags.push({ _id: tag._id, name: tag.name })
            }
        }

        // 创建测试帖子（带标签）
        const postData = [
            {
                title: '欢迎来到内部论坛',
                content: '这是内部论坛的第一条帖子，欢迎大家积极发言讨论！',
                summary: '欢迎大家来到内部论坛，这是一个供大家交流讨论的平台。',
                categoryIndex: 0,
                authorId: user1._id,
                isPinned: true,
                viewCount: 100,
                replyCount: 5,
                likeCount: 10,
                tagIndices: [] as number[]
            },
            {
                title: 'React 19 新特性分享',
                content: 'React 19 引入了很多新特性，包括 Actions、use() Hook 等...',
                summary: 'React 19 带来了一些令人兴奋的新功能，让我们一起来了解一下。',
                categoryIndex: 0,
                authorId: user2._id,
                isPinned: false,
                viewCount: 50,
                replyCount: 3,
                likeCount: 8,
                tagIndices: [0, 2, 3] // React, TypeScript, 前端
            },
            {
                title: '周末一起去爬山吗？',
                content: '这周末天气不错，想组织一起去爬山，有兴趣的同事可以报名~',
                summary: '周末组织爬山活动，欢迎大家参加！',
                categoryIndex: 1,
                authorId: user1._id,
                isPinned: false,
                viewCount: 30,
                replyCount: 12,
                likeCount: 15,
                tagIndices: [] as number[]
            },
            {
                title: '如何配置开发环境？',
                content: '新人求助，请问如何配置开发环境？需要安装哪些工具？',
                summary: '新人求助开发环境配置问题。',
                categoryIndex: 2,
                authorId: user2._id,
                isPinned: false,
                viewCount: 20,
                replyCount: 8,
                likeCount: 3,
                tagIndices: [3, 4] // 前端, 后端
            },
            {
                title: '推荐一款好用的笔记软件',
                content: '最近发现一款很好用的笔记软件，推荐给大家...',
                summary: '分享一款好用的笔记软件。',
                categoryIndex: 3,
                authorId: user1._id,
                isPinned: false,
                viewCount: 45,
                replyCount: 6,
                likeCount: 20,
                tagIndices: [] as number[]
            },
            {
                title: 'Kooboo 框架使用心得',
                content: '使用 Kooboo 开发项目已经一段时间了，分享一些心得体会...',
                summary: '分享 Kooboo 框架的使用心得。',
                categoryIndex: 0,
                authorId: user2._id,
                isPinned: true,
                viewCount: 80,
                replyCount: 10,
                likeCount: 25,
                tagIndices: [5, 4] // Kooboo, 后端
            },
            {
                title: 'Vue 3 组合式 API 入门',
                content: 'Vue 3 的组合式 API 是未来趋势，本文带你快速入门...',
                summary: 'Vue 3 组合式 API 入门指南。',
                categoryIndex: 0,
                authorId: user1._id,
                isPinned: false,
                viewCount: 60,
                replyCount: 4,
                likeCount: 12,
                tagIndices: [1, 2, 3] // Vue, TypeScript, 前端
            },
            {
                title: 'TypeScript 高级类型实战',
                content: '分享一些 TypeScript 高级类型的使用技巧...',
                summary: 'TypeScript 高级类型实战技巧。',
                categoryIndex: 0,
                authorId: user2._id,
                isPinned: false,
                viewCount: 35,
                replyCount: 2,
                likeCount: 7,
                tagIndices: [2, 3] // TypeScript, 前端
            }
        ]

        let postCount = 0
        for (let i = 0; i < postData.length; i++) {
            const data = postData[i]
            const category = categories[data.categoryIndex]
            if (!category) continue

            const id = Forum_Post.create({
                title: data.title,
                content: data.content,
                summary: data.summary,
                authorId: data.authorId,
                categoryId: category._id,
                isPinned: data.isPinned,
                viewCount: data.viewCount,
                replyCount: data.replyCount,
                likeCount: data.likeCount,
                shareCount: 0
            })

            if (id) {
                postCount++
                // 添加标签关联
                if (data.tagIndices.length > 0) {
                    const tagIds = data.tagIndices
                        .filter(idx => tags[idx])
                        .map(idx => tags[idx]._id)
                    if (tagIds.length > 0) {
                        ForumTagService.addTagsToPost(id, tagIds)
                    }
                }

                // 为部分帖子创建回复（用于测试已解决和点赞功能）
                // 只有索引 0, 1, 3, 5 的帖子有回复
                const replyConfig: Record<number, { replies: Array<{ authorIdx: number; content: string; likeCount: number; isAccepted?: boolean }> }> = {
                    0: { replies: [
                        { authorIdx: 1, content: '欢迎欢迎！', likeCount: 5, isAccepted: true }, // 第一条设为解决方案
                        { authorIdx: 0, content: '希望这个论坛越办越好', likeCount: 3 }
                    ]},
                    1: { replies: [
                        { authorIdx: 0, content: 'Actions 感觉很强大', likeCount: 8 },
                        { authorIdx: 1, content: 'use() Hook 可以直接读取 promise，很方便', likeCount: 12, isAccepted: true }
                    ]},
                    3: { replies: [
                        { authorIdx: 0, content: 'VSCode + ESLint + Prettier 是标配', likeCount: 6 },
                        { authorIdx: 1, content: '推荐使用 WSL 开发，体验更好', likeCount: 10, isAccepted: true }
                    ]},
                    5: { replies: [
                        { authorIdx: 0, content: 'Kooboo 的模板引擎很好用', likeCount: 4 }
                    ]}
                }

                const replyData = replyConfig[i]
                if (replyData) {
                    for (const reply of replyData.replies) {
                        const replyAuthor = reply.authorIdx === 0 ? user1 : user2
                        if (!replyAuthor) continue

                        const replyId = Forum_Reply.create({
                            postId: id,
                            authorId: replyAuthor._id,
                            content: reply.content,
                            likeCount: reply.likeCount,
                            isAccepted: reply.isAccepted || false
                        })

                        // 如果是已接受的回复，更新帖子的 isSolved 状态
                        if (replyId && reply.isAccepted) {
                            Forum_Post.updateById(id, {
                                isSolved: true,
                                acceptedReplyId: replyId
                            })
                        }
                    }
                }
            }
        }

        return successResponse({
            message: `创建成功：${categories.length} 个分类，${tags.length} 个标签，${postCount} 篇帖子`,
            categories: categories.length,
            tags: tags.length,
            posts: postCount
        })
    } catch (e: any) {
        return failResponse(e?.message || '生成测试数据失败')
    }
})

/**
 * 创建帖子
 */
k.api.post('create', () => {
    try {
        // 获取当前登录用户
        const userId = ForumPostService.getCurrentUserId()
        if (!userId) {
            return failResponse('请先登录')
        }

        // 解析请求参数
        const bodyStr = k.request.body
        let body: { title?: string; content?: string; categoryId?: string; tags?: string[] }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { title, content, categoryId, tags } = body

        // 参数验证
        if (!title || title.trim().length === 0) {
            return failResponse('请输入帖子标题')
        }
        if (!content || content.trim().length === 0) {
            return failResponse('请输入帖子内容')
        }
        if (!categoryId) {
            return failResponse('请选择分类')
        }

        // 创建帖子
        const post = ForumPostService.createPost(title, content, categoryId, userId)

        // 如果有标签，添加到帖子
        if (tags && tags.length > 0 && post) {
            const tagIds: string[] = []
            for (const tagName of tags) {
                if (tagName.trim()) {
                    const tag = ForumTagService.createTag(tagName.trim())
                    if (tag) {
                        tagIds.push(tag._id)
                    }
                }
            }
            if (tagIds.length > 0) {
                ForumTagService.addTagsToPost(post._id, tagIds)
            }
        }

        return successResponse({ post })
    } catch (e: any) {
        return failResponse(e?.message || '创建帖子失败')
    }
})

/**
 * 获取帖子详情
 */
k.api.get('detail', () => {
    try {
        const postId = k.request.get('postId')
        if (!postId) {
            return failResponse('缺少帖子ID')
        }

        const post = ForumPostService.getPostDetail(postId)

        // 获取帖子标签
        const tags = ForumTagService.getPostTags(postId)

        return successResponse({ post: { ...post, tags } })
    } catch (e: any) {
        return failResponse(e?.message || '获取帖子详情失败')
    }
})

/**
 * 创建评论
 */
k.api.post('reply/create', () => {
    try {
        // 获取当前登录用户
        const userId = ForumPostService.getCurrentUserId()
        if (!userId) {
            return failResponse('请先登录')
        }

        // 解析请求参数
        const bodyStr = k.request.body
        let body: { postId?: string; content?: string; parentId?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { postId, content, parentId } = body

        // 参数验证
        if (!postId) {
            return failResponse('缺少帖子ID')
        }
        if (!content || content.trim().length === 0) {
            return failResponse('请输入评论内容')
        }

        // 创建评论
        const reply = ForumPostService.createReply(postId, content, userId, parentId || '')
        return successResponse({ reply })
    } catch (e: any) {
        return failResponse(e?.message || '创建评论失败')
    }
})

/**
 * 获取评论列表
 */
k.api.get('reply/list', () => {
    try {
        const postId = k.request.get('postId')
        if (!postId) {
            return failResponse('缺少帖子ID')
        }

        const sortOrder = (k.request.get('sortOrder') as 'ASC' | 'DESC') || 'DESC'
        // 使用嵌套回复列表
        const replies = ForumPostService.getNestedReplyList(postId, sortOrder)
        return successResponse({ replies })
    } catch (e: any) {
        return failResponse(e?.message || '获取评论列表失败')
    }
})

/**
 * 编辑帖子
 */
k.api.post('edit', () => {
    try {
        // 获取当前登录用户
        const userId = ForumPostService.getCurrentUserId()
        if (!userId) {
            return failResponse('请先登录')
        }

        // 解析请求参数
        const bodyStr = k.request.body
        let body: { postId?: string; title?: string; content?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { postId, title, content } = body

        // 参数验证
        if (!postId) {
            return failResponse('缺少帖子ID')
        }
        if (!title || title.trim().length === 0) {
            return failResponse('请输入帖子标题')
        }
        if (!content || content.trim().length === 0) {
            return failResponse('请输入帖子内容')
        }

        // 编辑帖子
        const post = ForumPostService.editPost(postId, title, content)
        return successResponse({ post })
    } catch (e: any) {
        return failResponse(e?.message || '编辑帖子失败')
    }
})

/**
 * 删除帖子
 */
k.api.post('delete', () => {
    try {
        // 获取当前登录用户
        const userId = ForumPostService.getCurrentUserId()
        if (!userId) {
            return failResponse('请先登录')
        }

        // 解析请求参数
        const bodyStr = k.request.body
        let body: { postId?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { postId } = body

        // 参数验证
        if (!postId) {
            return failResponse('缺少帖子ID')
        }

        // 删除帖子
        const result = ForumPostService.deletePost(postId)
        return successResponse(result)
    } catch (e: any) {
        return failResponse(e?.message || '删除帖子失败')
    }
})

/**
 * 删除回复
 */
k.api.post('reply/delete', () => {
    try {
        // 获取当前登录用户
        const userId = ForumPostService.getCurrentUserId()
        if (!userId) {
            return failResponse('请先登录')
        }

        // 解析请求参数
        const bodyStr = k.request.body
        let body: { replyId?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { replyId } = body

        // 参数验证
        if (!replyId) {
            return failResponse('缺少回复ID')
        }

        // 删除回复
        const result = ForumPostService.deleteReply(replyId)
        return successResponse(result)
    } catch (e: any) {
        return failResponse(e?.message || '删除回复失败')
    }
})

/**
 * 上传图片
 */
k.api.post('upload/image', () => {
    try {
        // 检查是否有文件
        if (!k.request.files || k.request.files.length === 0) {
            return failResponse('请选择要上传的图片')
        }

        const file = k.request.files[0]
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!file.contentType || !allowedTypes.includes(file.contentType)) {
            return failResponse('仅支持 JPG、PNG、GIF、WebP 格式图片')
        }

        // 限制文件大小（2MB）
        const maxSize = 2 * 1024 * 1024
        if (file.bytes.length > maxSize) {
            return failResponse('图片大小不能超过 2MB')
        }

        // contentType 到扩展名的映射
        const contentTypeToExt: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp'
        }

        // 优先使用 contentType 获取扩展名，备用 file.name
        let ext = contentTypeToExt[file.contentType || '']
        if (!ext) {
            ext = (file.name || 'jpg').split('.').pop() || 'jpg'
        }

        const fileName = `forum_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

        // 保存到静态资源目录
        const result = file.save('media/forum/' + fileName)

        return successResponse({ url: result.url })
    } catch (e: any) {
        return failResponse(e?.message || '图片上传失败')
    }
})

/**
 * 点赞或取消点赞帖子/评论
 */
k.api.post('like', () => {
    try {
        const userId = ForumPostService.getCurrentUserId()
        if (!userId) {
            return failResponse('请先登录')
        }

        const bodyStr = k.request.body
        let body: { targetType?: string; targetId?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { targetType, targetId } = body

        if (!targetType || !targetId) {
            return failResponse('缺少参数')
        }
        if (!['post', 'reply'].includes(targetType)) {
            return failResponse('无效的目标类型')
        }

        const result = ForumPostService.toggleLike(targetType, targetId)
        return successResponse(result)
    } catch (e: any) {
        return failResponse(e?.message || '操作失败')
    }
})

/**
 * 获取帖子互动状态（点赞、收藏）
 */
k.api.get('status', () => {
    try {
        const postId = k.request.get('postId')
        if (!postId) {
            return failResponse('缺少帖子ID')
        }

        const post = Forum_Post.findById(postId)
        if (!post) {
            return failResponse('帖子不存在')
        }

        const isLiked = ForumPostService.isLiked('post', postId)
        const isCollected = ForumCollectionService.isCollected(postId)

        return successResponse({
            isLiked,
            isCollected,
            likeCount: post.likeCount || 0,
            shareCount: post.shareCount || 0
        })
    } catch (e: any) {
        return failResponse(e?.message || '获取状态失败')
    }
})

/**
 * 收藏或取消收藏帖子
 */
k.api.post('collect', () => {
    try {
        const userId = ForumPostService.getCurrentUserId()
        if (!userId) {
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

        const result = ForumCollectionService.toggleCollect(postId)
        return successResponse(result)
    } catch (e: any) {
        return failResponse(e?.message || '操作失败')
    }
})

/**
 * 获取相关帖子
 */
k.api.get('related', () => {
    try {
        const postId = k.request.get('postId')
        if (!postId) {
            return failResponse('缺少帖子ID')
        }

        const limit = parseInt(k.request.get('limit') || '5')
        const posts = ForumPostService.getRelatedPosts(postId, limit)
        return successResponse({ posts })
    } catch (e: any) {
        return failResponse(e?.message || '获取相关帖子失败')
    }
})

/**
 * 分享帖子
 */
k.api.post('share', () => {
    try {
        const postId = k.request.get('postId')
        if (!postId) {
            return failResponse('缺少帖子ID')
        }

        const result = ForumPostService.incrementShareCount(postId)
        return successResponse(result)
    } catch (e: any) {
        return failResponse(e?.message || '分享失败')
    }
})

/**
 * 获取当前用户的收藏列表
 */
k.api.get('saved', () => {
    try {
        const page = parseInt(k.request.get('page') || '1')
        const pageSize = parseInt(k.request.get('pageSize') || '10')
        const result = ForumCollectionService.getUserCollections(page, pageSize)
        return successResponse(result)
    } catch (e: any) {
        return failResponse(e?.message || '获取收藏列表失败')
    }
})

/**
 * 标记回复为解决方案
 */
k.api.post('mark-solution', () => {
    try {
        const userId = ForumPostService.getCurrentUserId()
        if (!userId) {
            return failResponse('请先登录')
        }

        const bodyStr = k.request.body
        let body: { postId?: string; replyId?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { postId, replyId } = body

        if (!postId) {
            return failResponse('缺少帖子ID')
        }
        if (!replyId) {
            return failResponse('缺少回复ID')
        }

        const result = ForumPostService.markSolution(postId, replyId)
        return successResponse(result)
    } catch (e: any) {
        return failResponse(e?.message || '标记解决方案失败')
    }
})

/**
 * 取消标记解决方案
 */
k.api.post('unmark-solution', () => {
    try {
        const postId = k.request.get('postId')
        if (!postId) {
            return failResponse('缺少帖子ID')
        }

        const result = ForumPostService.unmarkSolution(postId)
        return successResponse(result)
    } catch (e: any) {
        return failResponse(e?.message || '取消标记失败')
    }
})

/**
 * 获取用户的已解决帖子数量
 */
k.api.get('user-solved-count', () => {
    try {
        const userId = k.request.get('userId')
        if (!userId) {
            return failResponse('缺少用户ID')
        }

        const count = ForumPostService.getUserSolvedCount(userId)
        return successResponse({ count })
    } catch (e: any) {
        return failResponse(e?.message || '获取已解决数量失败')
    }
})
