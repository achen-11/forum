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
          if (res.code === 200 && res.data) {
            set({
              user: {
                _id: res.data.userId,
                userName: res.data.userName,
                displayName: res.data.name,
                phone: res.data.phone,
                email: res.data.email,
                avatar: '',
                role: 'user',
                createdAt: Date.now(),
                lastLoginAt: Date.now(),
              },
              token: res.data.token,
              isAuthenticated: true,
              isLoading: false,
            })
            return true
          } else {
            set({ error: res.message || '登录失败', isLoading: false })
            return false
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false })
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
          const res = await authApi.getCurrentUser()
          if (res.code === 200 && res.data) {
            set({ user: res.data, isAuthenticated: true })
          } else {
            set({ user: null, token: null, isAuthenticated: false })
          }
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      clearError: () => set({ error: null }),

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await authApi.register(data)
          if (res.code === 200 && res.data) {
            set({
              user: {
                _id: res.data.userId,
                userName: res.data.userName,
                displayName: res.data.name,
                phone: res.data.phone,
                email: res.data.email,
                avatar: '',
                role: 'user',
                createdAt: Date.now(),
                lastLoginAt: Date.now(),
              },
              token: res.data.token,
              isAuthenticated: true,
              isLoading: false,
            })
            return true
          } else {
            set({ error: res.message || '注册失败', isLoading: false })
            return false
          }
        } catch (error) {
          set({ error: '网络错误', isLoading: false })
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
