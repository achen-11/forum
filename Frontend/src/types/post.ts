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

// 评论类型定义
export interface Reply {
  _id: string
  postId: string
  parentId: string
  authorId: string
  author?: UserInfo
  content: string
  createdAt: string
  updatedAt: string
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

// 创建帖子请求
export interface CreatePostParams {
  title: string
  content: string
  categoryId: string
}

// 创建帖子响应
export interface CreatePostResponse {
  post: Post
}

// 帖子详情响应
export interface PostDetailResponse {
  post: Post
}

// 创建评论请求
export interface CreateReplyParams {
  postId: string
  content: string
  parentId?: string
}

// 创建评论响应
export interface CreateReplyResponse {
  reply: Reply
}

// 评论列表响应
export interface ReplyListResponse {
  replies: Reply[]
}

// 图片上传响应
export interface UploadImageResponse {
  url: string
}

// 搜索结果分页
export interface SearchPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// 搜索响应（解包后的格式）
export interface SearchResponse {
  list: Post[]
  pagination: SearchPagination
}
