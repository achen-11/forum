import type { Category, Post } from '@/types/post'

interface ApiResponse<T> {
  success?: boolean
  code?: number
  data?: T
  message?: string
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  const result: ApiResponse<T> = await response.json()
  // 兼容两种响应格式：success 或 code
  if (result.success === false || (result.code && result.code !== 200)) {
    throw new Error(result.message || '请求失败')
  }
  return result.data as T
}

export const postApi = {
  /**
   * 获取分类列表
   */
  getCategoryList: async (): Promise<Category[]> => {
    const data = await fetchApi<{ categories: Category[] }>('/api/forum/post/categories')
    return data.categories
  },

  /**
   * 获取帖子列表
   * @param categoryId 可选的分类 ID
   */
  getPostList: async (categoryId?: string): Promise<Post[]> => {
    const url = categoryId
      ? `/api/forum/post/list?categoryId=${encodeURIComponent(categoryId)}`
      : '/api/forum/post/list'
    const data = await fetchApi<{ posts: Post[] }>(url)
    return data.posts
  },
}
