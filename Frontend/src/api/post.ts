import { http } from '@/lib/request'
import type { Category, Post, Reply, Tag, CreatePostParams, CreateReplyParams, SearchResponse, SearchPagination, EditPostParams, DeleteResponse, SavedPostsResponse } from '@/types/post'

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
   * @param page 页码（从 1 开始）
   * @param pageSize 每页数量
   */
  getPostList: async (categoryId?: string, authorId?: string, page: number = 1, pageSize: number = 10): Promise<{ list: Post[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }> => {
    const params = new URLSearchParams()
    if (categoryId) params.set('categoryId', categoryId)
    if (authorId) params.set('authorId', authorId)
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    const url = `/api/forum/post/list?${params.toString()}`
    const data = await http.get<{ list: Post[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>(url)
    return data as unknown as { list: Post[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }
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
   * @param tag 标签名称（与 keyword 二选一）
   */
  searchPosts: async (keyword: string, categoryId?: string, page: number = 1, pageSize: number = 10, tag?: string): Promise<SearchResponse> => {
    const params = new URLSearchParams()
    if (keyword) {
      params.set('keyword', keyword)
    }
    if (tag) {
      params.set('tag', tag)
    }
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

  /**
   * 点赞或取消点赞
   */
  toggleLike: async (targetType: 'post' | 'reply', targetId: string): Promise<{ isLiked: boolean; message: string }> => {
    const data = await http.post<{ isLiked: boolean; message: string }>('/api/forum/post/like', {
      targetType,
      targetId
    })
    return data as unknown as { isLiked: boolean; message: string }
  },

  /**
   * 收藏或取消收藏帖子
   */
  toggleCollect: async (postId: string): Promise<{ isCollected: boolean; message: string }> => {
    const data = await http.post<{ isCollected: boolean; message: string }>('/api/forum/post/collect', { postId })
    return data as unknown as { isCollected: boolean; message: string }
  },

  /**
   * 获取帖子互动状态
   */
  getPostStatus: async (postId: string): Promise<{
    isLiked: boolean
    isCollected: boolean
    likeCount: number
    shareCount: number
  }> => {
    const data = await http.get<{
      isLiked: boolean
      isCollected: boolean
      likeCount: number
      shareCount: number
    }>(`/api/forum/post/status?postId=${encodeURIComponent(postId)}`)
    return data as unknown as {
      isLiked: boolean
      isCollected: boolean
      likeCount: number
      shareCount: number
    }
  },

  /**
   * 获取相关帖子
   */
  getRelatedPosts: async (postId: string, limit: number = 5): Promise<Post[]> => {
    const data = await http.get<{ posts: Post[] }>(`/api/forum/post/related?postId=${encodeURIComponent(postId)}&limit=${limit}`)
    return (data as unknown as { posts: Post[] }).posts
  },

  /**
   * 分享帖子
   */
  sharePost: async (postId: string): Promise<{ shareCount: number; message: string }> => {
    const data = await http.post<{ shareCount: number; message: string }>(`/api/forum/post/share?postId=${encodeURIComponent(postId)}`, {})
    return data as unknown as { shareCount: number; message: string }
  },

  /**
   * 获取当前用户的收藏列表
   */
  getSavedPosts: async (page: number = 1, pageSize: number = 10): Promise<SavedPostsResponse> => {
    const data = await http.get<SavedPostsResponse>(`/api/forum/post/saved?page=${page}&pageSize=${pageSize}`)
    return data as unknown as SavedPostsResponse
  },

  /**
   * 编辑帖子
   */
  editPost: async (params: EditPostParams): Promise<Post> => {
    const data = await http.post<{ post: Post }>('/api/forum/post/edit', params)
    return (data as unknown as { post: Post }).post
  },

  /**
   * 删除帖子
   */
  deletePost: async (postId: string): Promise<DeleteResponse> => {
    const data = await http.post<DeleteResponse>('/api/forum/post/delete', { postId })
    return data as unknown as DeleteResponse
  },

  /**
   * 删除回复
   */
  deleteReply: async (replyId: string): Promise<DeleteResponse> => {
    const data = await http.post<DeleteResponse>('/api/forum/post/reply/delete', { replyId })
    return data as unknown as DeleteResponse
  },

  /**
   * 标记回复为解决方案
   */
  markSolution: async (postId: string, replyId: string): Promise<{ success: boolean; message: string }> => {
    const data = await http.post<{ success: boolean; message: string }>('/api/forum/post/mark-solution', {
      postId,
      replyId
    })
    return data as unknown as { success: boolean; message: string }
  },

  /**
   * 取消标记解决方案
   */
  unmarkSolution: async (postId: string): Promise<{ success: boolean; message: string }> => {
    const data = await http.post<{ success: boolean; message: string }>(`/api/forum/post/unmark-solution?postId=${encodeURIComponent(postId)}`, {})
    return data as unknown as { success: boolean; message: string }
  },

  /**
   * 获取用户的已解决帖子数
   */
  getUserSolvedCount: async (userId: string): Promise<number> => {
    const data = await http.get<{ count: number }>(`/api/forum/post/user-solved-count?userId=${encodeURIComponent(userId)}`)
    return (data as unknown as { count: number }).count
  },
}
