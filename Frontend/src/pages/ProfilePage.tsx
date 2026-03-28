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
  Phone,
} from 'lucide-react'

type NavItem = 'profile' | 'posts' | 'saved' | 'notifications'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, updateProfile, bindEmail: bindEmailAction, bindPhone: bindPhoneAction, replaceEmail: replaceEmailAction, replacePhone: replacePhoneAction } = useAuthStore()

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

  // Bind email modal states
  const [bindEmailOpen, setBindEmailOpen] = useState(false)
  const [bindEmailStep, setBindEmailStep] = useState<'input' | 'verify_old' | 'verify_new'>('input')
  const [bindEmail, setBindEmail] = useState('')
  const [bindEmailCode, setBindEmailCode] = useState('')
  const [oldEmailForReplace, setOldEmailForReplace] = useState('')
  const [oldEmailCode, setOldEmailCode] = useState('')
  const [newEmailForBind, setNewEmailForBind] = useState('')
  const [newEmailCode, setNewEmailCode] = useState('')
  const [bindEmailLoading, setBindEmailLoading] = useState(false)
  const [sendCodeLoading, setSendCodeLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Bind phone modal states
  const [bindPhoneOpen, setBindPhoneOpen] = useState(false)
  const [bindPhoneStep, setBindPhoneStep] = useState<'input' | 'verify_old' | 'verify_new'>('input')
  const [bindPhone, setBindPhone] = useState('')
  const [bindPhoneCode, setBindPhoneCode] = useState('')
  const [oldPhoneForReplace, setOldPhoneForReplace] = useState('')
  const [oldPhoneCode, setOldPhoneCode] = useState('')
  const [newPhoneForBind, setNewPhoneForBind] = useState('')
  const [newPhoneCode, setNewPhoneCode] = useState('')
  const [bindPhoneLoading, setBindPhoneLoading] = useState(false)


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

  // Countdown timer for resend code
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // Handle send verification code
  const handleSendCode = async (account: string, accountType: 'phone' | 'email', codeType: 'bind' | 'verify_old') => {
    const trimmedAccount = account.trim()
    if (!trimmedAccount) {
      toast.error(accountType === 'email' ? '请输入邮箱地址' : '请输入手机号')
      return
    }
    if (accountType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedAccount)) {
      toast.error('请输入正确的邮箱地址')
      return
    }
    if (accountType === 'phone' && !/^1[3-9]\d{9}$/.test(trimmedAccount)) {
      toast.error('请输入正确的手机号')
      return
    }
    setSendCodeLoading(true)
    try {
      await authApi.sendCode({ account: trimmedAccount, accountType, codeType })
      toast.success('验证码已发送')
      setCountdown(60)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '发送失败')
    } finally {
      setSendCodeLoading(false)
    }
  }

  // Handle bind email
  const handleBindEmail = async () => {
    if (!bindEmail.trim()) {
      toast.error('请输入邮箱地址')
      return
    }
    if (!bindEmailCode.trim()) {
      toast.error('请输入验证码')
      return
    }
    setBindEmailLoading(true)
    try {
      await bindEmailAction(bindEmail.trim(), bindEmailCode.trim())
      toast.success('邮箱绑定成功')
      setBindEmailOpen(false)
      resetBindEmailState()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '绑定失败')
    } finally {
      setBindEmailLoading(false)
    }
  }

  // Handle replace email
  const handleReplaceEmail = async () => {
    if (!newEmailForBind.trim() || !newEmailCode.trim()) {
      toast.error('请填写完整信息')
      return
    }
    if (newEmailForBind.trim().toLowerCase() === user?.email?.toLowerCase()) {
      toast.error('新邮箱不能与旧邮箱相同')
      return
    }
    setBindEmailLoading(true)
    try {
      await replaceEmailAction(user!.email, oldEmailCode.trim(), newEmailForBind.trim(), newEmailCode.trim())
      toast.success('邮箱更换成功')
      setBindEmailOpen(false)
      resetBindEmailState()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更换失败')
    } finally {
      setBindEmailLoading(false)
    }
  }

  // Handle verify old email (for replace flow)
  const handleVerifyOldEmail = async () => {
    if (!user?.email || !oldEmailCode.trim()) {
      toast.error('请输入验证码')
      return
    }
    setBindEmailLoading(true)
    try {
      await authApi.verifyOldContact({ account: user.email, accountType: 'email', code: oldEmailCode.trim() })
      toast.success('验证成功')
      setBindEmailStep('verify_new')
      setCountdown(0) // 重置倒计时
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '验证失败')
    } finally {
      setBindEmailLoading(false)
    }
  }

  // Handle bind phone
  const handleBindPhone = async () => {
    if (!bindPhone.trim()) {
      toast.error('请输入手机号')
      return
    }
    if (!bindPhoneCode.trim()) {
      toast.error('请输入验证码')
      return
    }
    setBindPhoneLoading(true)
    try {
      await bindPhoneAction(bindPhone.trim(), bindPhoneCode.trim())
      toast.success('手机号绑定成功')
      setBindPhoneOpen(false)
      resetBindPhoneState()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '绑定失败')
    } finally {
      setBindPhoneLoading(false)
    }
  }

  // Handle replace phone
  const handleReplacePhone = async () => {
    if (!newPhoneForBind.trim() || !newPhoneCode.trim()) {
      toast.error('请填写完整信息')
      return
    }
    if (newPhoneForBind.trim() === user?.phone) {
      toast.error('新手机号不能与旧手机号相同')
      return
    }
    setBindPhoneLoading(true)
    try {
      await replacePhoneAction(user!.phone, oldPhoneCode.trim(), newPhoneForBind.trim(), newPhoneCode.trim())
      toast.success('手机号更换成功')
      setBindPhoneOpen(false)
      resetBindPhoneState()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更换失败')
    } finally {
      setBindPhoneLoading(false)
    }
  }

  // Handle verify old phone (for replace flow)
  const handleVerifyOldPhone = async () => {
    if (!user?.phone || !oldPhoneCode.trim()) {
      toast.error('请输入验证码')
      return
    }
    setBindPhoneLoading(true)
    try {
      await authApi.verifyOldContact({ account: user.phone, accountType: 'phone', code: oldPhoneCode.trim() })
      toast.success('验证成功')
      setBindPhoneStep('verify_new')
      setCountdown(0) // 重置倒计时
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '验证失败')
    } finally {
      setBindPhoneLoading(false)
    }
  }

  // Reset bind email state
  const resetBindEmailState = () => {
    setBindEmailStep('input')
    setBindEmail('')
    setBindEmailCode('')
    setOldEmailForReplace('')
    setOldEmailCode('')
    setNewEmailForBind('')
    setNewEmailCode('')
    setCountdown(0)
  }

  // Reset bind phone state
  const resetBindPhoneState = () => {
    setBindPhoneStep('input')
    setBindPhone('')
    setBindPhoneCode('')
    setOldPhoneForReplace('')
    setOldPhoneCode('')
    setNewPhoneForBind('')
    setNewPhoneCode('')
    setCountdown(0)
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
                {/* Bind / Replace Email */}
                <button
                  onClick={() => {
                    resetBindEmailState()
                    setBindEmailOpen(true)
                  }}
                  className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">邮箱 {user.email ? '已绑定' : '未绑定'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Bind / Replace Phone */}
                <button
                  onClick={() => {
                    resetBindPhoneState()
                    setBindPhoneOpen(true)
                  }}
                  className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">手机号 {user.phone ? '已绑定' : '未绑定'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

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

      {/* Bind Email Modal */}
      {bindEmailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {user.email ? '更换邮箱' : '绑定邮箱'}
              </h2>
              <button
                onClick={() => {
                  setBindEmailOpen(false)
                  resetBindEmailState()
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If already bound, show replace flow */}
            {user.email ? (
              bindEmailStep === 'input' ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">为保障账号安全，更换邮箱需要先验证您当前绑定的邮箱。</p>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">当前邮箱</label>
                    <Input
                      value={oldEmailForReplace}
                      onChange={(e) => setOldEmailForReplace(e.target.value)}
                      placeholder={user.email}
                      className="mt-1"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">验证码</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={oldEmailCode}
                        onChange={(e) => setOldEmailCode(e.target.value)}
                        placeholder="输入验证码"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendCode(user.email, 'email', 'verify_old')}
                        disabled={sendCodeLoading || countdown > 0 || !user.email}
                      >
                        {sendCodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : '发送验证码'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleVerifyOldEmail}
                      disabled={bindEmailLoading || !oldEmailCode.trim()}
                      className="flex-1"
                    >
                      {bindEmailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '验证'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBindEmailOpen(false)
                        resetBindEmailState()
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">验证成功，请输入新的邮箱地址。</p>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">新邮箱</label>
                    <Input
                      value={newEmailForBind}
                      onChange={(e) => setNewEmailForBind(e.target.value)}
                      placeholder="输入新邮箱"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">验证码</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newEmailCode}
                        onChange={(e) => setNewEmailCode(e.target.value)}
                        placeholder="输入验证码"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (newEmailForBind.trim().toLowerCase() === user?.email?.toLowerCase()) {
                            toast.error('新邮箱不能与旧邮箱相同')
                            return
                          }
                          handleSendCode(newEmailForBind, 'email', 'bind')
                        }}
                        disabled={sendCodeLoading || countdown > 0 || !newEmailForBind.trim()}
                      >
                        {sendCodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : '发送验证码'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleReplaceEmail}
                      disabled={bindEmailLoading || !newEmailCode.trim() || !newEmailForBind.trim()}
                      className="flex-1"
                    >
                      {bindEmailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '更换邮箱'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBindEmailStep('input')
                        setNewEmailForBind('')
                        setNewEmailCode('')
                      }}
                    >
                      上一步
                    </Button>
                  </div>
                </div>
              )
            ) : (
              /* First time bind - no email bound */
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">邮箱地址</label>
                  <Input
                    value={bindEmail}
                    onChange={(e) => setBindEmail(e.target.value)}
                    placeholder="输入邮箱地址"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">验证码</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={bindEmailCode}
                      onChange={(e) => setBindEmailCode(e.target.value)}
                      placeholder="输入验证码"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendCode(bindEmail, 'email', 'bind')}
                      disabled={sendCodeLoading || countdown > 0 || !bindEmail.trim()}
                    >
                      {sendCodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleBindEmail}
                    disabled={bindEmailLoading || !bindEmailCode.trim()}
                    className="flex-1"
                  >
                    {bindEmailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '绑定'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBindEmailOpen(false)
                      resetBindEmailState()
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bind Phone Modal */}
      {bindPhoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {user.phone ? '更换手机号' : '绑定手机号'}
              </h2>
              <button
                onClick={() => {
                  setBindPhoneOpen(false)
                  resetBindPhoneState()
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If already bound, show replace flow */}
            {user.phone ? (
              bindPhoneStep === 'input' ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">为保障账号安全，更换手机号需要先验证您当前绑定的手机号。</p>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">当前手机号</label>
                    <Input
                      value={oldPhoneForReplace}
                      onChange={(e) => setOldPhoneForReplace(e.target.value)}
                      placeholder={user.phone}
                      className="mt-1"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">验证码</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={oldPhoneCode}
                        onChange={(e) => setOldPhoneCode(e.target.value)}
                        placeholder="输入验证码"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendCode(user.phone, 'phone', 'verify_old')}
                        disabled={sendCodeLoading || countdown > 0 || !user.phone}
                      >
                        {sendCodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : '发送验证码'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleVerifyOldPhone}
                      disabled={bindPhoneLoading || !oldPhoneCode.trim()}
                      className="flex-1"
                    >
                      {bindPhoneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '验证'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBindPhoneOpen(false)
                        resetBindPhoneState()
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">验证成功，请输入新的手机号。</p>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">新手机号</label>
                    <Input
                      value={newPhoneForBind}
                      onChange={(e) => setNewPhoneForBind(e.target.value)}
                      placeholder="输入新手机号"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">验证码</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newPhoneCode}
                        onChange={(e) => setNewPhoneCode(e.target.value)}
                        placeholder="输入验证码"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (newPhoneForBind.trim() === user?.phone) {
                            toast.error('新手机号不能与旧手机号相同')
                            return
                          }
                          handleSendCode(newPhoneForBind, 'phone', 'bind')
                        }}
                        disabled={sendCodeLoading || countdown > 0 || !newPhoneForBind.trim()}
                      >
                        {sendCodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : '发送验证码'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleReplacePhone}
                      disabled={bindPhoneLoading || !newPhoneCode.trim() || !newPhoneForBind.trim()}
                      className="flex-1"
                    >
                      {bindPhoneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '更换手机号'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBindPhoneStep('input')
                        setNewPhoneForBind('')
                        setNewPhoneCode('')
                      }}
                    >
                      上一步
                    </Button>
                  </div>
                </div>
              )
            ) : (
              /* First time bind - no phone bound */
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">手机号</label>
                  <Input
                    value={bindPhone}
                    onChange={(e) => setBindPhone(e.target.value)}
                    placeholder="输入手机号"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">验证码</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={bindPhoneCode}
                      onChange={(e) => setBindPhoneCode(e.target.value)}
                      placeholder="输入验证码"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendCode(bindPhone, 'phone', 'bind')}
                      disabled={sendCodeLoading || countdown > 0 || !bindPhone.trim()}
                    >
                      {sendCodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleBindPhone}
                    disabled={bindPhoneLoading || !bindPhoneCode.trim()}
                    className="flex-1"
                  >
                    {bindPhoneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '绑定'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBindPhoneOpen(false)
                      resetBindPhoneState()
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
