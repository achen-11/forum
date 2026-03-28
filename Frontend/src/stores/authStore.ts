import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/auth'
import type { LoginRequest, UserInfo } from '@/types/auth'

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
        const { token } = get()
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
