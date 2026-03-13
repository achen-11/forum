import { http } from '@/lib/request'
import type { Category, Post } from '@/types/post'

export const postApi = {
  /**
   * 获取分类列表
   */
  getCategoryList: async (): Promise<Category[]> => {
    const data = await http.get<{ categories: Category[] }>('/api/forum/post/categories')
    return (data as unknown as { categories: Category[] }).categories
  },

  /**
   * 获取帖子列表
   * @param categoryId 可选的分类 ID
   */
  getPostList: async (categoryId?: string): Promise<Post[]> => {
    const url = categoryId
      ? `/api/forum/post/list?categoryId=${encodeURIComponent(categoryId)}`
      : '/api/forum/post/list'
    const data = await http.get<{ posts: Post[] }>(url)
    return (data as unknown as { posts: Post[] }).posts
  },
}
