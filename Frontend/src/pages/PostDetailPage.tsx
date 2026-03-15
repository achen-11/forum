import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { postApi } from '@/api/post'
import type { Post, Reply } from '@/types/post'
import { ArrowLeft, Eye, MessageCircle, Clock, Send, ArrowUpDown } from 'lucide-react'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')

  // 加载帖子和评论
  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [postData, repliesData] = await Promise.all([
          postApi.getPostDetail(id),
          postApi.getReplyList(id, sortOrder),
        ])
        setPost(postData)
        setReplies(repliesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, sortOrder])

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
        <div className="animate-spin w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full" />
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 帖子内容 */}
        <article className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          {/* 标题和分类 */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              {post.category && (
                <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                  {post.category.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {post.replyCount}
              </span>
            </div>
          </div>

          {/* 作者信息 */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-slate-200 text-slate-600">
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
          </div>

          {/* 帖子内容 */}
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
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
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSubmitReply}
                disabled={!replyContent.trim() || isSubmitting}
                className="bg-slate-900 hover:bg-slate-800"
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
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                      {getInitials(reply.author?.displayName || reply.author?.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900 text-sm">
                        {reply.author?.displayName || reply.author?.userName || '未知用户'}
                      </span>
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
      </main>
    </div>
  )
}
