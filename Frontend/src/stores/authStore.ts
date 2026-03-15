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
          set({
            user: {
              _id: res.userId,
              userName: res.userName,
              displayName: res.name,
              phone: res.phone,
              email: res.email,
              avatar: '',
              role: 'user',
              createdAt: Date.now(),
              lastLoginAt: Date.now(),
            },
            token: res.token,
            isAuthenticated: true,
            isLoading: false,
          })
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

      clearError: () => set({ error: null }),

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await authApi.register(data)
          // http 拦截器已经处理了响应格式，直接返回 data
          set({
            user: {
              _id: res.userId,
              userName: res.userName,
              displayName: res.name,
              phone: res.phone,
              email: res.email,
              avatar: '',
              role: 'user',
              createdAt: Date.now(),
              lastLoginAt: Date.now(),
            },
            token: res.token,
            isAuthenticated: true,
            isLoading: false,
          })
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
