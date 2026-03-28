import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/auth'
import type { LoginRequest, UserInfo } from '@/types/auth'

/**
 * 获取 cookie 值
 */
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

interface AuthState {
  user: UserInfo | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (data: LoginRequest) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateProfile: (data: { displayName?: string; avatar?: string }) => Promise<void>
  bindEmail: (email: string, verificationCode: string) => Promise<UserInfo>
  bindPhone: (phone: string, verificationCode: string) => Promise<UserInfo>
  replaceEmail: (oldEmail: string, oldCode: string, newEmail: string, newCode: string) => Promise<UserInfo>
  replacePhone: (oldPhone: string, oldCode: string, newPhone: string, newCode: string) => Promise<UserInfo>
  koobooLogin: () => Promise<boolean>
  clearError: () => void
  register: (data: {
    userName?: string
    phone?: string
    email?: string
    password: string
    verificationCode: string
    accountType: 'username' | 'phone' | 'email'
  }) => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
          const res = await authApi.login(data)
          // http 拦截器已经处理了响应格式，直接返回 data
          // 先设置基本用户信息，token 设置后 http 拦截器会自动带上
          set({
            token: res.token,
            isAuthenticated: true,
            isLoading: false,
          })
          // 然后获取完整的用户信息（包含 role）
          const fullUser = await authApi.getCurrentUser()
          set({ user: fullUser })
          return true
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : '登录失败'
          set({ error: message, isLoading: false })
          return false
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // ignore error
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      checkAuth: async () => {
        let { token } = get()
        // 如果 zustand store 中没有 token，尝试从 cookie 获取
        if (!token) {
          const cookieToken = getCookie('forum_auth_token')
          if (cookieToken) {
            token = cookieToken
            set({ token })
          }
        }
        if (!token) return

        set({ isLoading: true })
        try {
          const user = await authApi.getCurrentUser()
          set({ user, isAuthenticated: true })
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      updateProfile: async (data) => {
        try {
          const user = await authApi.updateProfile(data)
          set({ user })
        } catch (error: unknown) {
          throw error
        }
      },

      bindEmail: async (email: string, verificationCode: string) => {
        const user = await authApi.bindEmail({ email, verificationCode })
        set({ user })
        return user
      },

      bindPhone: async (phone: string, verificationCode: string) => {
        const user = await authApi.bindPhone({ phone, verificationCode })
        set({ user })
        return user
      },

      replaceEmail: async (oldEmail: string, oldCode: string, newEmail: string, newCode: string) => {
        const user = await authApi.replaceEmail({ oldEmail, oldCode, newEmail, newCode })
        set({ user })
        return user
      },

      replacePhone: async (oldPhone: string, oldCode: string, newPhone: string, newCode: string) => {
        const user = await authApi.replacePhone({ oldPhone, oldCode, newPhone, newCode })
        set({ user })
        return user
      },

      koobooLogin: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await authApi.koobooLogin()
          set({
            token: res.token,
            isAuthenticated: true,
            isLoading: false,
          })
          const fullUser = await authApi.getCurrentUser()
          set({ user: fullUser })
          return true
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Kooboo 登录失败'
          set({ error: message, isLoading: false })
          return false
        }
      },

      clearError: () => set({ error: null }),

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await authApi.register(data)
          // http 拦截器已经处理了响应格式，直接返回 data
          set({
            token: res.token,
            isAuthenticated: true,
            isLoading: false,
          })
          // 获取完整的用户信息（包含 role）
          const fullUser = await authApi.getCurrentUser()
          set({ user: fullUser })
          return true
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : '注册失败'
          set({ error: message, isLoading: false })
          return false
        }
      },
    }),
    {
      name: 'forum-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
