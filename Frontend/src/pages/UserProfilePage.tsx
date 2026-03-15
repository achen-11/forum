import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { authApi } from '@/api/auth'
import { postApi } from '@/api/post'
import { PostItem } from '@/components/PostItem'
import type { Post } from '@/types/post'
import type { UserInfo } from '@/types/auth'
import { ArrowLeft, User, Mail, Phone, Loader2 } from 'lucide-react'

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 并行请求用户信息与 TA 的帖子，避免瀑布流
  useEffect(() => {
    if (!id) {
      setError('缺少用户 ID')
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([
      authApi.getUserDetail(id),
      postApi.getPostList(undefined, id),
    ])
      .then(([userData, postsData]) => {
        if (!cancelled) {
          setUser(userData)
          setPosts(postsData)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error || '用户不存在'}</p>
        <Button onClick={() => navigate('/')} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Button>
      </div>
    )
  }

  const hasAvatar = user.avatar && user.avatar.trim() !== ''
  const displayName = user.displayName || user.userName || '用户'

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <h1 className="text-lg font-semibold text-slate-900">用户主页</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Avatar className="w-16 h-16 shrink-0">
                {hasAvatar ? (
                  <AvatarImage src={user.avatar} alt="" />
                ) : null}
                <AvatarFallback className="bg-slate-200 text-slate-600 text-lg">
                  {displayName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-slate-900">{displayName}</p>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">TA 的帖子</CardTitle>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <p className="text-center text-slate-500 py-8">暂无发帖</p>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
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
