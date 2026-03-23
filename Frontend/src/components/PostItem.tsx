import { Link } from 'react-router-dom'
import { MessageCircle, Heart, Pin, Bookmark, CheckCircle } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { Post } from '@/types/post'

interface PostItemProps {
  post: Post
  onClick: () => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN')
}

export function PostItem({ post, onClick }: PostItemProps) {
  return (
    <article
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer hover:shadow-md transition-all group ${
        post.isPinned ? 'border-indigo-200 hover:border-indigo-300' : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      <div className="flex gap-4">
        {/* 左侧：作者头像 */}
        <div className="shrink-0">
          <Avatar className="w-10 h-10">
            {post.author?.avatar ? (
              <AvatarImage src={post.author.avatar} alt="" />
            ) : null}
            <AvatarFallback className="bg-slate-200 text-slate-600">
              {(post.author?.userName || post.author?.displayName || '?').slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* 右侧：上下布局 */}
        <div className="flex-1 min-w-0">
          {/* 第一行：作者信息 · 发布时间 · 置顶/已解决 */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {post.author?._id ? (
                <Link
                  to={`/user/${post.author._id}`}
                  className="font-medium text-slate-900 hover:text-indigo-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.author?.displayName || post.author?.userName || '匿名用户'}
                </Link>
              ) : (
                <span className="font-medium text-slate-900">
                  {post.author?.displayName || post.author?.userName || '匿名用户'}
                </span>
              )}
              <span>·</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              {post.isSolved && (
                <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle className="w-3 h-3" />
                  已解决
                </div>
              )}
              {post.isPinned && (
                <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  <Pin className="w-3 h-3" />
                  置顶
                </div>
              )}
            </div>
          </div>

          {/* 标题 */}
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
            {post.title}
          </h3>

          {/* 摘要 */}
          {post.summary && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{post.summary}</p>
          )}

          {/* 分类/标签 + 点赞/回复 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.category && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                  {post.category.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1 hover:text-red-500">
                <Heart className="w-4 h-4" />
                <span>{post.likeCount || 0}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-indigo-600">
                <MessageCircle className="w-4 h-4" />
                <span>{post.replyCount || 0}</span>
              </div>
              <button
                className="p-1 hover:text-indigo-600"
                onClick={(e) => e.stopPropagation()}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
