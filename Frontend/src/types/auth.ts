export interface LoginRequest {
  account: string
  password?: string
  verificationCode?: string
  loginMode: 'password' | 'code'
  isRemember?: boolean
}

export interface LoginResponse {
  token: string
  userId: string
  name: string
  phone: string
  email: string
  userName: string
}

export interface SendCodeRequest {
  account: string
  accountType: 'phone' | 'email'
  codeType: 'login' | 'register' | 'forgot' | 'bind' | 'verify_old'
}

export interface SendCodeResponse {
  message: string
  phone?: string
  email?: string
}

export interface RegisterRequest {
  userName?: string
  phone?: string
  email?: string
  password: string
  verificationCode: string
  accountType: 'username' | 'phone' | 'email'
}

export interface UserInfo {
  _id: string
  userName: string
  displayName: string
  phone: string
  email: string
  avatar: string
  role: string
  koobooId: string
  createdAt: number
  lastLoginAt: number
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

// 用户评论
export interface UserComment {
  _id: string
  content: string
  createdAt: number
  post: {
    _id: string
    title: string
  } | null
}

// 用户活动 (帖子 + 评论的联合类型)
export interface UserActivity {
  type: 'post' | 'comment'
  _id: string
  title?: string
  content?: string
  createdAt: number
  post?: {
    _id: string
    title: string
  } | null
}
