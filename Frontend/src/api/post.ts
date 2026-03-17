import { http } from '@/lib/request'
import type { Category, Post, Reply, Tag, CreatePostParams, CreateReplyParams, SearchResponse, SearchPagination } from '@/types/post'

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

  /**
   * 搜索帖子
   * @param keyword 搜索关键词
   * @param categoryId 可选的分类 ID
   * @param page 页码
   * @param pageSize 每页数量
   */
  searchPosts: async (keyword: string, categoryId?: string, page: number = 1, pageSize: number = 10): Promise<SearchResponse> => {
    const params = new URLSearchParams()
    params.set('keyword', keyword)
    if (categoryId) params.set('categoryId', categoryId)
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    // http.get 返回的是解包后的 data，格式已经是 { list, pagination }
    const data = await http.get<{ list: Post[], pagination: SearchPagination }>(`/api/search/search?${params.toString()}`)
    return {
      list: data.list,
      pagination: data.pagination
    }
  },

  /**
   * 获取标签列表
   */
  getTagList: async (limit: number = 20): Promise<Tag[]> => {
    const data = await http.get<{ tags: Tag[] }>(`/api/forum/tag/list?limit=${limit}`)
    return (data as unknown as { tags: Tag[] }).tags
  },

  /**
   * 创建标签
   */
  createTag: async (name: string, color?: string): Promise<Tag> => {
    const data = await http.post<{ tag: Tag }>('/api/forum/tag/create', { name, color })
    return (data as unknown as { tag: Tag }).tag
  },
}
