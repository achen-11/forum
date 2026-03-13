// 帖子类型定义

export interface Post {
  _id: string
  title: string
  content: string
  summary?: string
  authorId: string
  author?: UserInfo
  categoryId: string
  category?: Category
  viewCount: number
  replyCount: number
  likeCount?: number
  isPinned: boolean
  isEssence?: boolean
  createdAt: string
  updatedAt: string
}

export interface UserInfo {
  _id: string
  userName?: string
  phone?: string
  email?: string
  displayName?: string
  avatar?: string
}

export interface Category {
  _id: string
  name: string
  description?: string
  parentId?: string
  sortOrder: number
}

// API 请求/响应类型

export interface PostListParams {
  categoryId?: string
  page?: number
  limit?: number
}

export interface PostListResponse {
  posts: Post[]
  total: number
  page: number
  limit: number
}

export interface CategoryListResponse {
  categories: Category[]
}
