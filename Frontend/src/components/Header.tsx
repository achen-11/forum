import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserAvatar } from '@/components/UserAvatar'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useNotificationSocket } from '@/hooks/useNotificationSocket'
import { Bell, ChevronDown, Search, CheckCheck, MessageCircle, Heart, UserPlus, Award, Megaphone } from 'lucide-react'
import type { NotificationItem } from '@/api/notification'

interface HeaderProps {
  onShowAllNotifications?: () => void
}

export function Header({ onShowAllNotifications }: HeaderProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotificationMenu, setShowNotificationMenu] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const notificationRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  } = useNotificationStore()

  // Connect to WebSocket for real-time notifications
  useNotificationSocket(user?._id || null)

  // Initial fetch
  useEffect(() => {
    if (user?._id) {
      fetchUnreadCount()
      fetchNotifications(true)
    }
  }, [user?._id, fetchUnreadCount, fetchNotifications])

  // Close notification menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setShowUserMenu(false)
    await logout()
    navigate('/login')
  }

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification._id)
    }
    setShowNotificationMenu(false)
    // Navigate based on notification type
    if (notification.targetId) {
      navigate(`/post/${notification.targetId}`)
    }
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
  }

  const getNotificationIcon = (type: NotificationItem['type']) => {
    const iconClass = 'w-5 h-5 text-slate-500'
    switch (type) {
      case 'reply':
        return <MessageCircle className={iconClass} />
      case 'like_post':
      case 'like_reply':
        return <Heart className={`${iconClass} text-red-400`} />
      case 'follow':
        return <UserPlus className={iconClass} />
      case 'best_answer':
        return <Award className={`${iconClass} text-amber-500`} />
      case 'system':
        return <Megaphone className={iconClass} />
      default:
        return <Bell className={iconClass} />
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 text-indigo-600">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img src='/forum.svg' />
            </div>
            <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Kooboo Forum</h1>
          </Link>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (searchInput.trim()) {
              navigate(`/search?keyword=${encodeURIComponent(searchInput.trim())}`)
            }
          }}
          className="hidden md:flex relative w-64 lg:w-96"
        >
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索讨论、标签或用户..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </form>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 w-80 max-h-[480px] overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">通知</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      <CheckCheck className="w-3 h-3" />
                      全部已读
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="overflow-y-auto max-h-[380px]">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      暂无通知
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0 ${
                          !notification.isRead ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 ml-2" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                              {notification.content}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowNotificationMenu(false)
                        if (onShowAllNotifications) {
                          onShowAllNotifications()
                        } else {
                          navigate('/?view=notifications')
                        }
                      }}
                      className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      查看全部通知
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Menu */}
          <div className="relative flex items-center gap-3 pl-1">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user?.displayName || user?.userName || '用户'}</p>
            </div>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 hover:bg-slate-100 rounded-lg p-1"
            >
              <UserAvatar user={user ?? {}} size="sm" />
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 py-2 min-w-[160px] z-50">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  个人主页
                </Link>
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <>
                    <hr className="my-2 border-slate-100" />
                    <Link
                      to="/admin/content"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      管理后台
                    </Link>
                  </>
                )}
                <hr className="my-2 border-slate-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
