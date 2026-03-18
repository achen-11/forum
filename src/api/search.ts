// @k-url /api/search/{action}

import { ForumPostService } from 'code/Services/ForumPostService'
import { ForumTagService } from 'code/Services/ForumTagService'

/**
 * 搜索帖子
 * GET /api/search/search
 * 参数:
 *   - keyword: 搜索关键词（与 tag 二选一）
 *   - tag: 标签名称（与 keyword 二选一）
 *   - categoryId: 分类ID（可选）
 *   - page: 页码（默认1）
 *   - pageSize: 每页数量（默认10，最大50）
 */
k.api.get('search', () => {
    // 获取查询参数
    const keyword = k.request.get('keyword') || ''
    const tag = k.request.get('tag') || ''
    const categoryId = k.request.get('categoryId') || ''
    const page = +(k.request.get('page')) || 1
    const pageSize = +(k.request.get('pageSize')) || 10

    // 参数校验：keyword 和 tag 必须有一个
    if (!keyword.trim() && !tag.trim()) {
        return {
            code: 400,
            message: '请输入搜索关键词或标签',
            data: null
        }
    }

    let result
    let searchType: 'keyword' | 'tag' = 'keyword'

    // 优先使用 keyword 搜索，其次使用 tag 搜索
    if (keyword.trim()) {
        result = ForumPostService.searchPosts(
            keyword.trim(),
            categoryId || undefined,
            page,
            pageSize
        )
        searchType = 'keyword'
    } else if (tag.trim()) {
        // 使用 tag 名称搜索
        result = ForumTagService.searchByTagName(
            tag.trim(),
            page,
            pageSize
        )
        searchType = 'tag'
    }

    return {
        code: 200,
        message: 'success',
        data: {
            ...result,
            searchType
        }
    }
})
