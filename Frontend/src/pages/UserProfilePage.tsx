import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserAvatar } from '@/components/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/Header'
import { authApi } from '@/api/auth'
import { postApi } from '@/api/post'
import type { Post } from '@/types/post'
import type { UserInfo, UserComment } from '@/types/auth'
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Users,
  Award,
  Eye,
  Heart,
  FileText,
  Zap,
} from 'lucide-react'

type TabValue = 'posts' | 'comments' | 'activity'

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<UserComment[]>([])
  const [followersCount, setFollowersCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowingLoading, setIsFollowingLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabValue>('posts')

  // 加载用户数据
  useEffect(() => {
    if (!id) {
      setError('缺少用户 ID')
      setIsLoading(false)
      return
    }
    let cancelled = false
    setIsLoading(true)
    setError('')

    Promise.all([
      authApi.getUserDetail(id),
      postApi.getPostList(undefined, id),
      authApi.getUserFollowers(id),
      authApi.getUserFollowing(id),
      authApi.getUserComments(id),
      authApi.isFollowing(id).catch(() => ({ isFollowing: false })),
    ])
      .then(([userData, postsData, followersData, , commentsData, followingStatus]) => {
        if (!cancelled) {
          setUser(userData)
          setPosts(postsData.list)
          setFollowersCount(followersData.count)
          setComments(commentsData)
          setIsFollowing(followingStatus.isFollowing)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  // 处理关注/取消关注
  const handleFollowToggle = async () => {
    if (!user) return
    setIsFollowingLoading(true)
    try {
      if (isFollowing) {
        await authApi.unfollow(user._id)
        setIsFollowing(false)
        setFollowersCount((prev) => Math.max(0, prev - 1))
      } else {
        await authApi.follow(user._id)
        setIsFollowing(true)
        setFollowersCount((prev) => prev + 1)
      }
    } catch (err) {
      console.error('Follow toggle failed:', err)
    } finally {
      setIsFollowingLoading(false)
    }
  }

  if (isLoading) {
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

  const displayName = user.displayName || user.userName || '用户'
  const postsCount = posts.length

  // 格式化时间
  const formatTime = (timestamp: string | number) => {
    const ts = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
    const now = Date.now()
    const diff = now - ts
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 30) return `${days} 天前`
    return new Date(timestamp).toLocaleDateString('zh-CN')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 通用 Header */}
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar with online status */}
              <div className="relative shrink-0">
                <UserAvatar user={user} size="2xl" />
                {/* Online status dot */}
                <div className="absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full border-4 border-white dark:border-slate-950" />
              </div>

              {/* User info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{displayName}</h1>
                    <p className="text-slate-500 font-medium">@{user.userName}</p>
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant={isFollowing ? 'outline' : 'default'}
                      onClick={handleFollowToggle}
                      disabled={isFollowingLoading}
                      className="gap-1.5"
                    >
                      <Users className="w-4 h-4" />
                      {isFollowing ? '已关注' : '关注'}
                    </Button>
                    {/* <Button variant="outline" className="gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      发消息
                    </Button> */}
                  </div>
                </div>

                {/* Bio / description */}
                <p className="text-slate-600 leading-relaxed max-w-2xl">
                  {user.email || user.phone ? (
                    <>
                      {user.email && <span className="mr-4">{user.email}</span>}
                      {user.phone && <span>{user.phone}</span>}
                    </>
                  ) : (
                    '暂无简介'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Posts */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{postsCount}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">帖子</p>
              </div>
            </CardContent>
          </Card>

          {/* Followers */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{followersCount}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">粉丝</p>
              </div>
            </CardContent>
          </Card>

          {/* Awards (placeholder) */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">--</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">成就</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="w-full border-b border-slate-200 dark:border-slate-800 bg-transparent h-auto p-0 gap-8 justify-start">
            <TabsTrigger
              value="posts"
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent rounded-none gap-1.5"
            >
              <FileText className="w-4 h-4" />
              帖子
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent rounded-none gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              评论
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent rounded-none gap-1.5"
            >
              <Zap className="w-4 h-4" />
              动态
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-6">
            {posts.length === 0 ? (
              <p className="text-center text-slate-500 py-8">暂无发帖</p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card
                    key={post._id}
                    className="hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/post/${post._id}`)}
                  >
                    <CardContent className="p-5">
                      {/* Category tag and time */}
                      <div className="flex justify-between items-start mb-3">
                        {post.category ? (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {post.category.name}
                          </Badge>
                        ) : (
                          <div />
                        )}
                        <span className="text-slate-400 text-xs">
                          {formatTime(post.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>

                      {/* Summary */}
                      {post.summary && (
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                          {post.summary}
                        </p>
                      )}

                      {/* Engagement metrics */}
                      <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Heart className="w-4 h-4" />
                          <span>{post.likeCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.replyCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Eye className="w-4 h-4" />
                          <span>{post.viewCount || 0} views</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="mt-6">
            {comments.length === 0 ? (
              <p className="text-center text-slate-500 py-8">暂无评论</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment._id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="p-5">
                      {comment.post && (
                        <p className="text-xs text-slate-500 mb-2">
                          评论了帖子:{' '}
                          <span
                            className="text-primary group-hover:underline cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/post/${comment.post!._id}`)
                            }}
                          >
                            {comment.post.title}
                          </span>
                        </p>
                      )}
                      <div
                        className="text-slate-700 dark:text-slate-300 mb-2 line-clamp-2 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                      />
                      <span className="text-slate-400 text-xs">
                        {formatTime(comment.createdAt)}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            {posts.length === 0 && comments.length === 0 ? (
              <p className="text-center text-slate-500 py-8">暂无活动</p>
            ) : (
              <div className="space-y-4">
                {/* 合并 posts 和 comments，按时间排序 */}
                {[
                  ...posts.map((p) => ({ type: 'post' as const, id: p._id, createdAt: p.createdAt, title: p.title, summary: p.summary, post: null, content: '' })),
                  ...comments.map((c) => ({ type: 'comment' as const, id: c._id, createdAt: c.createdAt, title: '', summary: '', post: c.post, content: c.content }))
                ]
                  .sort((a, b) => {
                    const aTime = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt
                    const bTime = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt
                    return bTime - aTime
                  })
                  .slice(0, 20)
                  .map((item) => (
                    <Card
                      key={`${item.type}-${item.id}`}
                      className="hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (item.type === 'post') {
                          navigate(`/post/${item.id}`)
                        } else if (item.post) {
                          navigate(`/post/${item.post._id}`)
                        }
                      }}
                    >
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.type === 'post' ? '发帖' : '评论'}
                          </Badge>
                          <span className="text-slate-400 text-xs">
                            {formatTime(item.createdAt)}
                          </span>
                        </div>
                        {item.type === 'post' ? (
                          <>
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                            {item.summary && (
                              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">
                                {item.summary}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            {item.post && (
                              <p className="text-xs text-slate-500 mb-1">
                                评论了:{' '}
                                <span className="text-primary hover:underline">
                                  {item.post.title}
                                </span>
                              </p>
                            )}
                            <div
                              className="text-slate-700 dark:text-slate-300 line-clamp-2 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: item.content }}
                            />
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
