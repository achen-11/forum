import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/authStore'
import { postApi } from '@/api/post'
import { PostItem } from '@/components/PostItem'
import type { Post } from '@/types/post'
import type { UserInfo } from '@/types/auth'
import { ArrowLeft, User, Mail, Phone, Loader2, Pencil } from 'lucide-react'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, updateProfile } = useAuthStore()
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  // 用户来自 store，仅拉取「我的帖子」避免瀑布流
  useEffect(() => {
    if (!user?._id) return
    let cancelled = false
    setPostsLoading(true)
    postApi
      .getPostList(undefined, user._id)
      .then((posts) => {
        if (!cancelled) setMyPosts(posts)
      })
      .finally(() => {
        if (!cancelled) setPostsLoading(false)
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

  const handleLogout = async () => {
    await logout()
    navigate('/login')
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
      alert(err instanceof Error ? err.message : '更新失败')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <h1 className="text-lg font-semibold text-slate-900">个人中心</h1>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              退出
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              基本信息
            </CardTitle>
            {editOpen ? null : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="gap-1"
              >
                <Pencil className="w-3 h-3" />
                编辑
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editOpen ? (
              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">昵称</label>
                  <Input
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    placeholder="昵称"
                    className="mt-1"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">头像 URL</label>
                  <Input
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitLoading}>
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
                    }}
                  >
                    取消
                  </Button>
                </div>
              </form>
            ) : (
              <ProfileInfoBlock user={user} />
            )}
          </CardContent>
        </Card>

        {/* 我发的帖子 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">我发的帖子</CardTitle>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
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
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function ProfileInfoBlock({ user }: { user: UserInfo }) {
  const hasAvatar = user.avatar && user.avatar.trim() !== ''
  return (
    <div className="flex gap-4">
      <Avatar className="w-16 h-16 shrink-0">
        {hasAvatar ? (
          <AvatarImage src={user.avatar} alt="" />
        ) : null}
        <AvatarFallback className="bg-slate-200 text-slate-600 text-lg">
          {(user.displayName || user.userName || '?').slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1 text-sm">
        <p className="font-medium text-slate-900">
          {user.displayName || user.userName || '—'}
        </p>
        <p className="text-slate-500">@{user.userName}</p>
        {user.email ? (
          <p className="flex items-center gap-1.5 text-slate-600">
            <Mail className="w-4 h-4" />
            {user.email}
          </p>
        ) : null}
        {user.phone ? (
          <p className="flex items-center gap-1.5 text-slate-600">
            <Phone className="w-4 h-4" />
            {user.phone}
          </p>
        ) : null}
      </div>
    </div>
  )
}
