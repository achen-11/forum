import { http } from '@/lib/request'
import type {
  LoginRequest,
  LoginResponse,
  SendCodeRequest,
  SendCodeResponse,
  RegisterRequest,
  UserInfo,
} from '@/types/auth'

const API_BASE = '/api/forum/auth'

export const authApi = {
  /**
   * 登录
   */
  login: (data: LoginRequest) =>
    http.post<LoginResponse>(`${API_BASE}/login`, data),

  /**
   * 发送验证码
   */
  sendCode: (data: SendCodeRequest) =>
    http.post<SendCodeResponse>(`${API_BASE}/send-code`, data),

  /**
   * 注册
   */
  register: (data: RegisterRequest) =>
    http.post<LoginResponse>(`${API_BASE}/register`, data),

  /**
   * 重置密码
   */
  resetPassword: (data: {
    account: string
    accountType: 'phone' | 'email' | 'username'
    newPassword: string
    verificationCode: string
  }) =>
    http.post<null>(`${API_BASE}/reset-password`, data),

  /**
   * 退出登录
   */
  logout: () =>
    http.post<null>(`${API_BASE}/logout`, {}),

  /**
   * 获取当前用户信息
   */
  getCurrentUser: () =>
    http.get<UserInfo>(`${API_BASE}/me`),

  /**
   * 获取用户详情
   */
  getUserDetail: (userId: string) =>
    http.get<UserInfo>(`${API_BASE}/user-detail?userId=${userId}`),
}
