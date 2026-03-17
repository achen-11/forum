import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { postApi } from '@/api/post'
import type { Post, Reply } from '@/types/post'
import { ArrowLeft, Eye, MessageCircle, Clock, Send, ArrowUpDown, Heart, Bookmark, Share2, ChevronRight, Users, BookOpen, Shield } from 'lucide-react'
import { Hash } from 'lucide-react'
import { Header } from '@/components/Header'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')

  // 互动状态
  const [isLiked, setIsLiked] = useState(false)
  const [isCollected, setIsCollected] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // 关注状态（本地模拟）
  const [isFollowing, setIsFollowing] = useState(false)

  // 加载帖子和评论
  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [postData, repliesData, statusData, relatedData] = await Promise.all([
          postApi.getPostDetail(id),
          postApi.getReplyList(id, sortOrder),
          postApi.getPostStatus(id),
          postApi.getRelatedPosts(id, 5)
        ])
        setPost(postData)
        setReplies(repliesData)
        setRelatedPosts(relatedData)
        setIsLiked(statusData.isLiked)
        setIsCollected(statusData.isCollected)
        setLikeCount(statusData.likeCount)
        setShareCount(statusData.shareCount)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, sortOrder])

  // 点赞/取消点赞
  const handleLike = async () => {
    if (!id || isProcessing) return
    setIsProcessing(true)
    try {
      const result = await postApi.toggleLike('post', id)
      setIsLiked(result.isLiked)
      setLikeCount(prev => result.isLiked ? prev + 1 : prev - 1)
    } catch (err) {
      console.error('点赞失败:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // 收藏/取消收藏
  const handleCollect = async () => {
    if (!id || isProcessing) return
    setIsProcessing(true)
    try {
      const result = await postApi.toggleCollect(id)
      setIsCollected(result.isCollected)
    } catch (err) {
      console.error('收藏失败:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // 分享
  const handleShare = async () => {
    if (!id || isProcessing) return
    setIsProcessing(true)
    try {
      const result = await postApi.sharePost(id)
      setShareCount(result.shareCount)
      // 复制链接到剪贴板
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      alert('链接已复制到剪贴板')
    } catch (err) {
      console.error('分享失败:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // 关注/取消关注（本地模拟）
  const handleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  // 提交评论
  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !id) return

    setIsSubmitting(true)
    try {
      const newReply = await postApi.createReply({
        postId: id,
        content: replyContent.trim(),
      })
      // 更新评论列表
      if (sortOrder === 'DESC') {
        setReplies([newReply, ...replies])
      } else {
        setReplies([...replies, newReply])
      }
      setReplyContent('')
      // 更新帖子评论数
      if (post) {
        setPost({ ...post, replyCount: post.replyCount + 1 })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '评论失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 切换排序
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'))
  }

  // 格式化时间
  const formatTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  // 获取用户头像 initials
  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name.slice(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-slate-300 border-t-indigo-600 rounded-full" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error || '帖子不存在'}</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      {/* Header - 使用共享组件 */}
      <Header />

      {/* Breadcrumb - 全宽 */}
      <div className="border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1 text-sm">
            <Link to="/" className="text-slate-500 hover:text-indigo-600">首页</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <Link to={`/?category=${post.category?._id}`} className="text-slate-500 hover:text-indigo-600">
              {post.category?.name || '分类'}
            </Link>
            {post.tags && post.tags.length > 0 && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900">{post.tags[0].name}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Post Content (70%) */}
          <div className="flex-1 lg:w-[70%]">
            {/* 帖子内容 */}
            <article className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              {/* 标题和分类 */}
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-900 mb-3">
                  {post.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-500 flex-wrap">
                  {post.category && (
                    <span className="px-2 py-0.5 bg-indigo-50 rounded-full text-indigo-600">
                      {post.category.name}
                    </span>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {post.tags.map((tag) => (
                        <Link
                          key={tag._id}
                          to={`/search?tag=${encodeURIComponent(tag.name)}`}
                          className="px-1.5 py-0.5 rounded-full text-xs hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: tag.color || '#6366f1', color: '#fff' }}
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 作者信息 */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {post.author?._id ? (
                    <Link to={`/user/${post.author._id}`} className="flex items-center gap-3 hover:opacity-80">
                      <Avatar className="w-10 h-10">
                        {post.author?.avatar ? (
                          <AvatarImage src={post.author.avatar} alt="" />
                        ) : null}
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {getInitials(post.author?.displayName || post.author?.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900">
                          {post.author?.displayName || post.author?.userName || '未知用户'}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(post.createdAt)}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <Avatar className="w-10 h-10">
                        {post.author?.avatar ? (
                          <AvatarImage src={post.author.avatar} alt="" />
                        ) : null}
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {getInitials(post.author?.displayName || post.author?.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900">
                          {post.author?.displayName || post.author?.userName || '未知用户'}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(post.createdAt)}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 互动按钮 */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={isLiked ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleLike}
                    disabled={isProcessing}
                    className={`gap-1.5 ${isLiked ? 'bg-red-500 hover:bg-red-600' : 'text-slate-600'}`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likeCount}</span>
                  </Button>
                  <Button
                    variant={isCollected ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleCollect}
                    disabled={isProcessing}
                    className={`gap-1.5 ${isCollected ? 'bg-indigo-600 hover:bg-indigo-700' : 'text-slate-600'}`}
                  >
                    <Bookmark className={`w-4 h-4 ${isCollected ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    disabled={isProcessing}
                    className="gap-1.5 text-slate-600"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{shareCount}</span>
                  </Button>
                </div>
              </div>

              {/* 帖子内容 */}
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* 底部统计 */}
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.viewCount} 阅读
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {post.replyCount} 评论
                </span>
              </div>
            </article>

            {/* 评论区域 */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* 评论标题和排序 */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  评论 ({post.replyCount})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="gap-1 text-slate-500"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortOrder === 'DESC' ? '最新优先' : '最早优先'}
                </Button>
              </div>

              {/* 评论输入框 */}
              <div className="mb-6">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="写下你的评论..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? '提交中...' : '发表评论'}
                  </Button>
                </div>
              </div>

              {/* 评论列表 */}
              <div className="space-y-4">
                {replies.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">
                    暂无评论，快来抢沙发吧
                  </p>
                ) : (
                  replies.map((reply) => (
                    <div
                      key={reply._id}
                      className="flex gap-3 p-4 bg-slate-50 rounded-lg"
                    >
                      {reply.author?._id ? (
                        <Link to={`/user/${reply.author._id}`} className="shrink-0">
                          <Avatar className="w-8 h-8 hover:opacity-80">
                            {reply.author?.avatar ? (
                              <AvatarImage src={reply.author.avatar} alt="" />
                            ) : null}
                            <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">
                              {getInitials(reply.author?.displayName || reply.author?.userName)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      ) : (
                        <Avatar className="w-8 h-8 shrink-0">
                          {reply.author?.avatar ? (
                            <AvatarImage src={reply.author.avatar} alt="" />
                          ) : null}
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">
                            {getInitials(reply.author?.displayName || reply.author?.userName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {reply.author?._id ? (
                            <Link
                              to={`/user/${reply.author._id}`}
                              className="font-medium text-slate-900 text-sm hover:underline"
                            >
                              {reply.author?.displayName || reply.author?.userName || '未知用户'}
                            </Link>
                          ) : (
                            <span className="font-medium text-slate-900 text-sm">
                              {reply.author?.displayName || reply.author?.userName || '未知用户'}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {formatTime(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar (30%) */}
          <aside className="lg:w-[30%] space-y-6">
            {/* 作者信息卡片 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                作者信息
              </h3>
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-16 h-16 mb-3">
                  {post.author?.avatar ? (
                    <AvatarImage src={post.author.avatar} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xl">
                    {getInitials(post.author?.displayName || post.author?.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="font-medium text-slate-900 mb-1">
                  {post.author?.displayName || post.author?.userName || '未知用户'}
                </div>
                <div className="text-sm text-slate-500 mb-3">
                  社区成员
                </div>
                <Button
                  onClick={handleFollow}
                  className={`w-full ${isFollowing ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {isFollowing ? '已关注' : '关注'}
                </Button>
              </div>
            </div>

            {/* 相关帖子 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                相关帖子
              </h3>
              {relatedPosts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">暂无相关帖子</p>
              ) : (
                <div className="space-y-3">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related._id}
                      to={`/post/${related._id}`}
                      className="block group"
                    >
                      <div className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 line-clamp-2">
                        {related.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          {related.viewCount}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="w-3 h-3" />
                          {related.replyCount}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 社区准则 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                社区准则
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>尊重他人，友善交流</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>内容积极，传递价值</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>遵守法律法规</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>不发布广告或垃圾信息</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
