import { create } from 'zustand'
import { NotificationItem, getNotificationList, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '@/api/notification'

interface NotificationState {
  notifications: NotificationItem[]
  unreadCount: number
  isLoading: boolean
  page: number
  pageSize: number
  hasMore: boolean

  // Actions
  fetchNotifications: (reset?: boolean) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  addNotification: (notification: NotificationItem) => void
  setLoading: (loading: boolean) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  page: 1,
  pageSize: 20,
  hasMore: true,

  fetchNotifications: async (reset = false) => {
    const state = get()
    if (state.isLoading) return

    set({ isLoading: true })

    try {
      const page = reset ? 1 : state.page
      const result = await getNotificationList({
        page,
        pageSize: state.pageSize
      })

      set({
        notifications: reset ? result.items : [...state.notifications, ...result.items],
        page: page + 1,
        hasMore: result.items.length === state.pageSize,
        isLoading: false
      })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const result = await getUnreadCount()
      set({ unreadCount: result.count })
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId)
      set(state => ({
        notifications: state.notifications.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllNotificationsRead()
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }))
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  },

  addNotification: (notification: NotificationItem) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }))
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  }
}))
