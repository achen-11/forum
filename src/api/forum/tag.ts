// @k-url /api/forum/tag/{action}

import { ForumTagService } from 'code/Services/ForumTagService'
import { successResponse, failResponse } from 'code/Utils/ResponseUtils'

/**
 * 获取标签列表
 */
k.api.get('list', () => {
    try {
        const limit = parseInt(k.request.get('limit') || '20')
        const tags = ForumTagService.getTagList(limit)
        return successResponse({ tags })
    } catch (e: any) {
        return failResponse(e?.message || '获取标签列表失败')
    }
})

/**
 * 创建标签
 */
k.api.post('create', () => {
    try {
        const bodyStr = k.request.body
        let body: { name?: string; color?: string }
        try {
            body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr
        } catch {
            return failResponse('请求参数格式错误')
        }

        const { name, color } = body

        if (!name || name.trim().length === 0) {
            return failResponse('请输入标签名称')
        }

        const tag = ForumTagService.createTag(name.trim(), color)
        return successResponse({ tag })
    } catch (e: any) {
        return failResponse(e?.message || '创建标签失败')
    }
})
