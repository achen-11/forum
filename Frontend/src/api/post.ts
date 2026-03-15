import { http } from '@/lib/request'
import type { Category, Post, Reply, CreatePostParams, CreateReplyParams } from '@/types/post'

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
   * @param authorId 可选的作者 ID（用于个人中心「我的帖子」）
   */
  getPostList: async (categoryId?: string, authorId?: string): Promise<Post[]> => {
    const params = new URLSearchParams()
    if (categoryId) params.set('categoryId', categoryId)
    if (authorId) params.set('authorId', authorId)
    const qs = params.toString()
    const url = qs ? `/api/forum/post/list?${qs}` : '/api/forum/post/list'
    const data = await http.get<{ posts: Post[] }>(url)
    return (data as unknown as { posts: Post[] }).posts
  },

  /**
   * 创建帖子
   */
  createPost: async (params: CreatePostParams): Promise<Post> => {
    const data = await http.post<{ post: Post }>('/api/forum/post/create', params)
    return (data as unknown as { post: Post }).post
  },

  /**
   * 获取帖子详情
   */
  getPostDetail: async (postId: string): Promise<Post> => {
    const data = await http.get<{ post: Post }>(`/api/forum/post/detail?postId=${encodeURIComponent(postId)}`)
    return (data as unknown as { post: Post }).post
  },

  /**
   * 创建评论
   */
  createReply: async (params: CreateReplyParams): Promise<Reply> => {
    const data = await http.post<{ reply: Reply }>('/api/forum/post/reply/create', params)
    return (data as unknown as { reply: Reply }).reply
  },

  /**
   * 获取评论列表
   */
  getReplyList: async (postId: string, sortOrder: 'ASC' | 'DESC' = 'DESC'): Promise<Reply[]> => {
    const url = `/api/forum/post/reply/list?postId=${encodeURIComponent(postId)}&sortOrder=${sortOrder}`
    const data = await http.get<{ replies: Reply[] }>(url)
    return (data as unknown as { replies: Reply[] }).replies
  },

  /**
   * 上传图片
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const data = await http.post<{ url: string }>('/api/forum/post/upload/image', formData as unknown as object)
    return (data as unknown as { url: string }).url
  },
}
