import { MessageCircle, Heart, Pin } from 'lucide-react'
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
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 cursor-pointer hover:shadow-md hover:border-slate-200 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* 置顶标识 */}
        {post.isPinned && (
          <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium bg-emerald-50 px-2 py-1 rounded">
            <Pin className="w-3 h-3" />
            置顶
          </div>
        )}

        {/* 主体内容 */}
        <div className="flex-1 min-w-0">
          {/* 标题 */}
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
            {post.title}
          </h3>

          {/* 摘要 */}
          {post.summary && (
            <p className="mt-2 text-sm text-slate-500 line-clamp-2">{post.summary}</p>
          )}

          {/* 元信息 */}
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
            {/* 作者 */}
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-medium text-xs">
                {post.author?.userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span>{post.author?.userName || post.author?.displayName || '匿名用户'}</span>
            </div>

            {/* 发布时间 */}
            <span>{formatDate(post.createdAt)}</span>

            {/* 分类标签 */}
            {post.category && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                {post.category.name}
              </span>
            )}
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{post.likeCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{post.replyCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
