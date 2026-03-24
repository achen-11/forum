import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Header } from '@/components/Header'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import { postApi } from '@/api/post'
import { toast } from '@/lib/toast'
import { PostItem } from '@/components/PostItem'
import type { Post, SavedPost } from '@/types/post'
import {
  Loader2,
  Pencil,
  Upload,
  X,
  Bell,
  User,
  FileText,
  Bookmark,
  LogOut,
  Mail,
  Calendar,
  Shield,
  ChevronRight,
} from 'lucide-react'

type NavItem = 'profile' | 'posts' | 'saved' | 'notifications'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, updateProfile } = useAuthStore()

  // Navigation state
  const [activeNav, setActiveNav] = useState<NavItem>('profile')

  // Data states
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [, setComments] = useState<any[]>([])
  const [postsCount, setPostsCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)
  const [likesCount, setLikesCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [solvedCount, setSolvedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Posts pagination states
  const [postsPage, setPostsPage] = useState(1)
  const [postsTotalPages, setPostsTotalPages] = useState(1)
  const [postsLoading, setPostsLoading] = useState(false)
  const PAGE_SIZE = 10

  // Edit profile states
  const [editOpen, setEditOpen] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Notification preferences (placeholder states)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [browserNotifications, setBrowserNotifications] = useState(false)
  const [weeklyDigest, setWeeklyDigest] = useState(true)

  // Change password modal states
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)


  // Saved posts state
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedPage, setSavedPage] = useState(1)
  const [savedTotalPages, setSavedTotalPages] = useState(1)

  // Load user data
  useEffect(() => {
    if (!user?._id) return
    let cancelled = false
    setIsLoading(true)

    Promise.all([
      postApi.getPostList(undefined, user._id, 1, PAGE_SIZE),
      authApi.getUserComments(user._id),
      postApi.getSavedPosts(1, 1), // 获取收藏列表（仅需总数）
      postApi.getUserSolvedCount(user._id), // 获取已解决帖子数
    ])
      .then(([postsData, commentsData, savedData, solvedCount]) => {
        if (!cancelled) {
          setMyPosts(postsData.list)
          setPostsCount(postsData.pagination.total)
          setPostsPage(1)
          setPostsTotalPages(postsData.pagination.totalPages)
          setComments(commentsData)
          setCommentsCount(commentsData.length)
          // Calculate total likes from posts
          const totalLikes = postsData.list.reduce((acc, post) => acc + (post.likeCount || 0), 0)
          setLikesCount(totalLikes)
          // Set saved count from API
          setSavedCount(savedData.pagination.total)
          // Set solved count from API
          setSolvedCount(solvedCount)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?._id])

  useEffect(() => {
    if (user) {
      setEditDisplayName(user.displayName ?? '')
      setEditAvatar(user.avatar ?? '')
    }
  }, [user])

  // Load saved posts when switching to saved tab
  useEffect(() => {
    if (activeNav !== 'saved') return
    let cancelled = false
    setSavedLoading(true)
    setSavedPage(1)
    postApi.getSavedPosts(1, PAGE_SIZE)
      .then((data) => {
        if (!cancelled) {
          setSavedPosts(data.list)
          setSavedCount(data.pagination.total)
          setSavedTotalPages(data.pagination.totalPages)
        }
      })
      .catch(() => {
        if (!cancelled) setSavedPosts([])
      })
      .finally(() => {
        if (!cancelled) setSavedLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeNav])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Handle change password
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword.trim()) {
      toast.error('请输入当前密码')
      return
    }
    if (!newPassword.trim()) {
      toast.error('请输入新密码')
      return
    }
    if (newPassword.length < 6) {
      toast.error('密码长度至少6位')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }
    setPasswordLoading(true)
    try {
      await authApi.changePassword({
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim()
      })
      toast.success('密码修改成功')
      setPasswordOpen(false)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '修改失败')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Handle load more posts
  const handleLoadMorePosts = async () => {
    if (!user?._id || postsLoading) return
    const nextPage = postsPage + 1
    setPostsLoading(true)
    try {
      const data = await postApi.getPostList(undefined, user._id, nextPage, PAGE_SIZE)
      setMyPosts(prev => [...prev, ...data.list])
      setPostsPage(nextPage)
      setPostsTotalPages(data.pagination.totalPages)
    } catch (err) {
      toast.error('加载失败')
    } finally {
      setPostsLoading(false)
    }
  }

  // Handle load more saved posts
  const handleLoadMoreSaved = async () => {
    if (savedLoading) return
    const nextPage = savedPage + 1
    setSavedLoading(true)
    try {
      const data = await postApi.getSavedPosts(nextPage, PAGE_SIZE)
      setSavedPosts(prev => [...prev, ...data.list])
      setSavedPage(nextPage)
      setSavedTotalPages(data.pagination.totalPages)
    } catch (err) {
      toast.error('加载失败')
    } finally {
      setSavedLoading(false)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过 2MB')
      return
    }

    setUploadLoading(true)
    try {
      const url = await postApi.uploadImage(file)
      // 同时更新本地预览和服务端数据
      setEditAvatar(url)
      setAvatarPreview(url)
      // 调用 API 持久化头像
      await authApi.updateProfile({ avatar: url })
      // 更新本地用户状态
      updateProfile({ avatar: url })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploadLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClearAvatar = () => {
    setEditAvatar('')
    setAvatarPreview('')
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSubmitLoading(true)
    try {
      await updateProfile({
        displayName: editDisplayName.trim() || undefined,
        avatar: editAvatar.trim() || undefined,
      })
      setEditOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失败')
    } finally {
      setSubmitLoading(false)
    }
  }

  // Format join date
  const formatJoinDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  const displayName = user.displayName || user.userName || '用户'

  // Render content based on active nav
  const renderContent = () => {
    switch (activeNav) {
      case 'profile':
        return (
          <>
            {/* Profile Header Card */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Gradient Cover */}
              <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/10 dark:to-transparent"></div>

              <div className="px-6 pb-6">
                <div className="relative flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-4">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-lg">
                      {(avatarPreview || user.avatar) ? (
                        <img src={avatarPreview || user.avatar} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-3xl font-bold">
                          {displayName.slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 p-1.5 bg-primary text-white rounded-lg shadow-lg hover:scale-105 transition-transform"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 pb-2">
                    <h1 className="text-2xl font-bold">{displayName}</h1>
                    <p className="text-slate-500 text-sm">@{user.userName}</p>
                  </div>

                  {/* Edit Button */}
                  <div className="pb-2">
                    <Button
                      onClick={() => setEditOpen(true)}
                      className="gap-1.5 bg-primary hover:bg-primary/90"
                    >
                      <Pencil className="w-4 h-4" />
                      编辑资料
                    </Button>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  {user.email && (
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400 text-sm">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">加入于 {formatJoinDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Security */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold">账户安全</h2>
              </div>

              <div className="space-y-4">
                {/* Change Password */}
                <button
                  onClick={() => setPasswordOpen(true)}
                  className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm font-medium">修改密码</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </section>

            {/* Forum Activity Summary */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h2 className="text-lg font-bold mb-6">论坛活动</h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-2xl font-black text-primary">{postsCount}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">发帖数</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-2xl font-black text-primary">{commentsCount}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">评论数</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-2xl font-black text-primary">{likesCount >= 1000 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">获赞数</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-2xl font-black text-primary">{solvedCount}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">已解决</p>
                  </div>
                </div>
              )}
            </section>
          </>
        )

      case 'posts':
        return (
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold">我的帖子</h2>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : myPosts.length === 0 ? (
                <p className="text-center text-slate-500 py-8">暂无发帖</p>
              ) : (
                <div className="space-y-3">
                  {myPosts.map((post) => (
                    <PostItem
                      key={post._id}
                      post={post}
                      onClick={() => navigate(`/post/${post._id}`)}
                    />
                  ))}
                  {postsPage < postsTotalPages && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={handleLoadMorePosts}
                        disabled={postsLoading}
                        className="gap-2"
                      >
                        {postsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        加载更多
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )

      case 'saved':
        return (
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold">收藏的帖子</h2>
            </div>
            <div className="p-6">
              {savedLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : savedPosts.length === 0 ? (
                <p className="text-center text-slate-500 py-8">暂无收藏</p>
              ) : (
                <div className="space-y-3">
                  {savedPosts.map((post) => (
                    <div
                      key={post._id}
                      className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/post/${post._id}`)}
                    >
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">{post.title}</h3>
                      {post.summary && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{post.summary}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>{post.viewCount} 阅读</span>
                        <span>{post.replyCount} 回复</span>
                        <span>{post.likeCount} 点赞</span>
                      </div>
                    </div>
                  ))}
                  {savedPage < savedTotalPages && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={handleLoadMoreSaved}
                        disabled={savedLoading}
                        className="gap-2"
                      >
                        {savedLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        加载更多
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )

      case 'notifications':
        return (
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">通知设置</h2>
            </div>

            <div className="space-y-4">
              {/* Email Alerts */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold">邮件提醒</p>
                  <p className="text-xs text-slate-500">有新回复时发送邮件通知</p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    emailNotifications ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                      emailNotifications ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Browser Push */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold">浏览器推送</p>
                  <p className="text-xs text-slate-500">启用浏览器推送通知</p>
                </div>
                <button
                  onClick={() => setBrowserNotifications(!browserNotifications)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    browserNotifications ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                      browserNotifications ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold">每周摘要</p>
                  <p className="text-xs text-slate-500">每周发送论坛动态摘要</p>
                </div>
                <button
                  onClick={() => setWeeklyDigest(!weeklyDigest)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    weeklyDigest ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                      weeklyDigest ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar Navigation */}
          <aside className="lg:w-56 lg:flex-shrink-0 lg:sticky lg:top-20 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <nav className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1">
              <button
                onClick={() => setActiveNav('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                  activeNav === 'profile'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <User className="w-5 h-5" />
                <span>个人资料</span>
              </button>
              <button
                onClick={() => setActiveNav('posts')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                  activeNav === 'posts'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>我的帖子</span>
              </button>
              <button
                onClick={() => setActiveNav('saved')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                  activeNav === 'saved'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className="w-5 h-5" />
                <span>收藏</span>
                <span className="ml-auto bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {savedCount}
                </span>
              </button>
              <button
                onClick={() => setActiveNav('notifications')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                  activeNav === 'notifications'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span>通知设置</span>
              </button>

              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>退出登录</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">编辑资料</h2>
              <button
                onClick={() => setEditOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">昵称</label>
                <Input
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="输入昵称"
                  className="mt-1"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">头像</label>
                <div className="mt-1 flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    {avatarPreview || editAvatar ? (
                      <AvatarImage src={avatarPreview || editAvatar} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-slate-200 text-slate-600 text-xl">
                      {displayName.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadLoading}
                      className="gap-1"
                    >
                      {uploadLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {editAvatar ? '更换头像' : '上传头像'}
                    </Button>
                    {editAvatar ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAvatar}
                        className="gap-1 text-slate-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                        清除
                      </Button>
                    ) : null}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  支持 JPG、PNG、GIF、WebP 格式，最大 2MB
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitLoading} className="flex-1">
                  {submitLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    '保存'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditOpen(false)
                    setEditDisplayName(user.displayName ?? '')
                    setEditAvatar(user.avatar ?? '')
                    setAvatarPreview('')
                  }}
                >
                  取消
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">修改密码</h2>
              <button
                onClick={() => setPasswordOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">当前密码</label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="输入当前密码"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">新密码</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="输入新密码"
                  className="mt-1"
                  maxLength={20}
                />
                <p className="text-xs text-slate-500 mt-1">密码长度 6-20 位</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">确认新密码</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入新密码"
                  className="mt-1"
                  maxLength={20}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={passwordLoading} className="flex-1">
                  {passwordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    '保存'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPasswordOpen(false)
                    setOldPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                >
                  取消
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
