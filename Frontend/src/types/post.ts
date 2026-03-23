// 帖子类型定义

// 标签类型
export interface Tag {
  _id: string
  name: string
  color?: string
  usageCount?: number
}

export interface Post {
  _id: string
  title: string
  content: string
  summary?: string
  authorId: string
  author?: UserInfo
  categoryId: string
  category?: Category
  tags?: Tag[]
  viewCount: number
  replyCount: number
  likeCount?: number
  shareCount?: number
  isPinned: boolean
  isEssence?: boolean
  isEdited?: boolean
  editedAt?: number
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
  role?: string
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
  rootReplyId: string
  authorId: string
  author?: UserInfo
  content: string
  createdAt: string
  updatedAt: string
  // 嵌套回复相关
  parentReply?: {
    _id: string
    authorId: string
  }
  replyTo?: {
    _id: string
    displayName?: string
    userName?: string
  }
  children?: Reply[]
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
  tags?: string[]
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

// 编辑帖子请求
export interface EditPostParams {
  postId: string
  title: string
  content: string
}

// 删除帖子/回复响应
export interface DeleteResponse {
  success: boolean
  message: string
}

// 收藏帖子项（简化版 Post）
export interface SavedPost {
  _id: string
  title: string
  summary?: string
  viewCount: number
  replyCount: number
  likeCount: number
  createdAt: number
  collectedAt: number
}

// 收藏帖子响应
export interface SavedPostsResponse {
  list: SavedPost[]
  pagination: SearchPagination
}
