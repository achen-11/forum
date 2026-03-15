// @k-url /api/forum/post/{action}

import { ForumPostService } from 'code/Services/ForumPostService'
import { Forum_Category } from 'code/Models/Forum_Category'
import { Forum_Post } from 'code/Models/Forum_Post'
import { Forum_User } from 'code/Models/Forum_User'
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
 */
k.api.get('list', () => {
    try {
        const categoryId = k.request.get('categoryId') || undefined
        const authorId = k.request.get('authorId') || undefined
        const posts = ForumPostService.getPostList(categoryId, authorId)
        return successResponse({ posts })
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

        const categories: Array<{ _id: string }> = []
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
                categories.push({ _id: existing._id })
            }
        }

        if (categories.length === 0 || !user1 || !user2) {
            return failResponse('创建测试数据失败')
        }

        // 创建测试帖子
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
                likeCount: 10
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
                likeCount: 8
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
                likeCount: 15
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
                likeCount: 3
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
                likeCount: 20
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
                likeCount: 25
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
                likeCount: data.likeCount
            })
            if (id) postCount++
        }

        return successResponse({
            message: `创建成功：${categories.length} 个分类，${postCount} 篇帖子`,
            categories: categories.length,
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
        let body: { title?: string; content?: string; categoryId?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { title, content, categoryId } = body

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
        return successResponse({ post })
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
        const replies = ForumPostService.getReplyList(postId, sortOrder)
        return successResponse({ replies })
    } catch (e: any) {
        return failResponse(e?.message || '获取评论列表失败')
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

        // 生成唯一文件名
        const ext = (file.name || 'jpg').split('.').pop() || 'jpg'
        const fileName = `forum_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

        // 保存到静态资源目录
        file.save('media/forum/' + fileName)

        // 返回访问 URL
        const imageUrl = `/media/forum/${fileName}`
        return successResponse({ url: imageUrl })
    } catch (e: any) {
        return failResponse(e?.message || '图片上传失败')
    }
})
