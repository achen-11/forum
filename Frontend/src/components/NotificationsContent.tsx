import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/EmptyState'
import {
  Bell,
  MessageCircle,
  Heart,
  UserPlus,
  Award,
  Megaphone,
  CheckCheck,
} from 'lucide-react'
import { getNotificationList, markNotificationRead, markAllNotificationsRead, type NotificationItem } from '@/api/notification'
import { toast } from '@/lib/toast'

// 格式化时间
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

// 获取名字首字母
const getInitials = (name?: string) => name?.slice(0, 2).toUpperCase() || '?'

// 获取通知图标
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

// 获取通知类型显示名称
const getNotificationTypeName = (type: NotificationItem['type']) => {
  switch (type) {
    case 'reply':
      return '回复'
    case 'like_post':
      return '点赞帖子'
    case 'like_reply':
      return '点赞回复'
    case 'follow':
      return '关注'
    case 'best_answer':
      return '最佳答案'
    case 'system':
      return '系统'
    default:
      return '通知'
  }
}

export function NotificationsContent() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)

  const pageSize = 20

  // 加载通知列表
  const loadNotifications = async (reset = false) => {
    try {
      const newPage = reset ? 1 : page
      const response = await getNotificationList({
        page: newPage,
        pageSize,
        ...(filter === 'unread' ? { isRead: false } : {})
      })

      if (reset) {
        setNotifications(response.items)
        setPage(2)
      } else {
        setNotifications(prev => [...prev, ...response.items])
        setPage(newPage + 1)
      }
      setHasMore(response.items.length === pageSize)
    } catch (err) {
      toast.error('加载通知失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    setPage(1)
    loadNotifications(true)
  }, [filter])

  // 标记单条已读
  const handleMarkRead = async (notification: NotificationItem) => {
    if (notification.isRead) return

    try {
      await markNotificationRead(notification._id)
      setNotifications(prev =>
        prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      toast.error('标记已读失败')
    }
  }

  // 标记全部已读
  const handleMarkAllRead = async () => {
    setMarkingAllRead(true)
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success('已全部标记为已读')
    } catch (err) {
      toast.error('操作失败')
    } finally {
      setMarkingAllRead(false)
    }
  }

  // 点击通知
  const handleNotificationClick = async (notification: NotificationItem) => {
    await handleMarkRead(notification)
    if (notification.targetId) {
      navigate(`/post/${notification.targetId}`)
    }
  }

  // 加载更多
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">通知</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unreadCount} 未读
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            全部已读
          </Button>
        )}
      </div>

      {/* 筛选标签 */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="unread">未读</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 通知列表 */}
      {loading && notifications.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? '没有未读通知' : '暂无通知'}
          description={filter === 'unread' ? '你已阅读所有通知' : '暂无通知消息'}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
                notification.isRead ? 'border-slate-200' : 'border-indigo-200 bg-indigo-50/30'
              }`}
            >
              <div className="flex gap-3">
                {/* 头像 */}
                {notification.actorAvatar ? (
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={notification.actorAvatar} alt="" />
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">
                      {getInitials(notification.actorName)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* 类型标签 + 时间在同一行 */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        notification.isRead
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {getNotificationTypeName(notification.type)}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>

                  {/* 内容 */}
                  <p className="text-sm text-slate-700 line-clamp-2">
                    {notification.content}
                  </p>

                  {/* 帖子标题卡片（如果有） */}
                  {notification.postTitle && (
                    <div className="mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500 mb-0.5">来自帖子</p>
                      <p className="text-sm text-slate-800 font-medium line-clamp-1">
                        {notification.postTitle}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* 加载更多 */}
          {hasMore && (
            <div className="text-center py-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                {loading ? '加载中...' : '加载更多'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
