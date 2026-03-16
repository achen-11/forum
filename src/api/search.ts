// @k-url /api/search/{action}

import { ForumPostService } from 'code/Services/ForumPostService'

/**
 * 搜索帖子
 * GET /api/search
 * 参数:
 *   - keyword: 搜索关键词（必填）
 *   - categoryId: 分类ID（可选）
 *   - page: 页码（默认1）
 *   - pageSize: 每页数量（默认10，最大50）
 */
k.api.get('search', () => {
    // 获取查询参数
    const keyword = k.request.get('keyword') || ''
    const categoryId = k.request.get('categoryId') || ''
    const page = +(k.request.get('page')) || 1
    const pageSize = +(k.request.get('pageSize')) || 10

    // 参数校验
    if (!keyword.trim()) {
        return {
            success: false,
            message: '请输入搜索关键词'
        }
    }

    // 调用 Service 层搜索
    const result = ForumPostService.searchPosts(
        keyword.trim(),
        categoryId || undefined,
        page,
        pageSize
    )

    return {
        success: true,
        data: result
    }
})
