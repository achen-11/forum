import type {
  LoginRequest,
  LoginResponse,
  SendCodeRequest,
  SendCodeResponse,
  RegisterRequest,
  UserInfo,
  ApiResponse
} from '@/types/auth'

const API_BASE = '/api/forum/auth'

function getAuthHeaders(): HeadersInit {
  // 从 cookie 中读取 token
  const cookies = document.cookie.split('; ')
  for (const cookie of cookies) {
    if (cookie.startsWith('forum_auth_token=')) {
      const token = cookie.split('=')[1]
      if (token) {
        return { Authorization: `Bearer ${token}` }
      }
    }
  }
  return {}
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
  })
  return response.json()
}

export const authApi = {
  /**
   * 登录
   */
  login: (data: LoginRequest) =>
    request<ApiResponse<LoginResponse>>(`${API_BASE}/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * 发送验证码
   */
  sendCode: (data: SendCodeRequest) =>
    request<ApiResponse<SendCodeResponse>>(`${API_BASE}/send-code`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * 注册
   */
  register: (data: RegisterRequest) =>
    request<ApiResponse<LoginResponse>>(`${API_BASE}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * 重置密码
   */
  resetPassword: (data: {
    account: string
    accountType: 'phone' | 'email' | 'username'
    newPassword: string
    verificationCode: string
  }) =>
    request<ApiResponse<null>>(`${API_BASE}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * 退出登录
   */
  logout: () =>
    request<ApiResponse<null>>(`${API_BASE}/logout`, {
      method: 'POST',
    }),

  /**
   * 获取当前用户信息
   */
  getCurrentUser: () =>
    request<ApiResponse<UserInfo>>(`${API_BASE}/me`),

  /**
   * 获取用户详情
   */
  getUserDetail: (userId: string) =>
    request<ApiResponse<UserInfo>>(`${API_BASE}/user-detail?userId=${userId}`),
}
