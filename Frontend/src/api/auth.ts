import { http } from '@/lib/request'
import type {
  LoginRequest,
  LoginResponse,
  SendCodeRequest,
  SendCodeResponse,
  RegisterRequest,
  UserInfo,
  UserComment,
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

  /**
   * 更新当前用户资料（displayName、avatar）
   */
  updateProfile: (data: { displayName?: string; avatar?: string }) =>
    http.post<UserInfo>(`${API_BASE}/update-profile`, data),

  /**
   * 修改密码
   */
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    http.post<null>(`${API_BASE}/change-password`, data),

  /**
   * 关注用户
   */
  follow: (followingId: string) =>
    http.post<{ success: boolean; message: string }>(`${API_BASE}/follow`, { followingId }),

  /**
   * 取消关注
   */
  unfollow: (followingId: string) =>
    http.post<{ success: boolean; message: string }>(`${API_BASE}/unfollow`, { followingId }),

  /**
   * 获取用户粉丝数量
   */
  getUserFollowers: (userId: string) =>
    http.get<{ count: number }>(`${API_BASE}/user-followers?userId=${userId}`),

  /**
   * 获取用户关注数量
   */
  getUserFollowing: (userId: string) =>
    http.get<{ count: number }>(`${API_BASE}/user-following?userId=${userId}`),

  /**
   * 检查是否已关注
   */
  isFollowing: (followingId: string) =>
    http.get<{ isFollowing: boolean }>(`${API_BASE}/is-following?followingId=${followingId}`),

  /**
   * 获取用户评论列表
   */
  getUserComments: (userId: string, limit: number = 20) =>
    http.get<UserComment[]>(`${API_BASE}/user-comments?userId=${userId}&limit=${limit}`),
}
