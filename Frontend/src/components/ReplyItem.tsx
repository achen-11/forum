import { Link } from 'react-router-dom'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CheckCircle, ThumbsUp } from 'lucide-react'
import type { Reply } from '@/types/post'

interface ReplyItemProps {
  reply: Reply
  rootReplyId: string
  onDelete: (replyId: string) => void
  canManage: (authorId?: string) => boolean
  onReply: (parentId: string, replyToName: string) => void
  isAccepted: boolean
  canMarkSolution: boolean
  onMarkSolution: (replyId: string) => void
  onLikeReply: (replyId: string) => void
  isLiked: boolean
  replyLikeCount: number
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

// 获取名字首字母
const getInitials = (name?: string) => name?.slice(0, 2).toUpperCase() || '?'

export function ReplyItem({
  reply,
  rootReplyId,
  onDelete,
  canManage,
  onReply,
  isAccepted,
  canMarkSolution,
  onMarkSolution,
  onLikeReply,
  isLiked,
  replyLikeCount,
}: ReplyItemProps) {
  const isChildOfRoot = reply.parentId === rootReplyId
  const showReplyTo = reply._id !== rootReplyId && !isChildOfRoot

  return (
    <div className={`flex gap-3 p-4 rounded-lg ${isAccepted ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}`} id={`reply-${reply._id}`}>
      {/* 头像 */}
      {reply.author?._id ? (
        <Link to={`/user/${reply.author._id}`} className="shrink-0">
          <Avatar className="w-8 h-8 hover:opacity-80">
            {reply.author?.avatar ? <AvatarImage src={reply.author.avatar} alt="" /> : null}
            <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">
              {getInitials(reply.author?.displayName || reply.author?.userName)}
            </AvatarFallback>
          </Avatar>
        </Link>
      ) : (
        <Avatar className="w-8 h-8 shrink-0">
          {reply.author?.avatar ? <AvatarImage src={reply.author.avatar} alt="" /> : null}
          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">
            {getInitials(reply.author?.displayName || reply.author?.userName)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex-1 min-w-0">
        {/* 用户名 + 时间 + 徽章 */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {reply.author?._id ? (
            <Link
              to={`/user/${reply.author._id}`}
              className="font-medium text-slate-900 text-sm hover:underline flex items-center gap-1"
            >
              {reply.author?.displayName || reply.author?.userName || '未知用户'}
              {reply.author?.role === 'admin' && (
                <span className="px-1 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">管理员</span>
              )}
            </Link>
          ) : (
            <span className="font-medium text-slate-900 text-sm">
              {reply.author?.displayName || reply.author?.userName || '未知用户'}
            </span>
          )}
          <span className="text-xs text-slate-400">{formatTime(reply.createdAt)}</span>

          {/* 最佳答案徽章 */}
          {isAccepted && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
              <CheckCircle className="w-3 h-3" />
              最佳答案
            </span>
          )}

          {/* 按钮区域 */}
          <div className="flex items-center gap-2 ml-auto">
            {/* 3+级回复显示"回复 XXX" */}
            {showReplyTo && (
              <span className="text-xs text-slate-400">
                回复 {reply.replyTo?.displayName || reply.replyTo?.userName}
              </span>
            )}
            {/* 点赞按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs ${isLiked ? 'text-red-500' : 'text-slate-500'}`}
              onClick={() => onLikeReply(reply._id)}
            >
              <ThumbsUp className={`w-3 h-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {replyLikeCount || 0}
            </Button>
            {/* 标记解决方案按钮（仅图标） */}
            {canMarkSolution && !isAccepted && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => onMarkSolution(reply._id)}
                title="标记为解决方案"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
            {/* 回复按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 h-6 px-2 text-xs"
              onClick={() => onReply(reply._id, reply.author?.displayName || reply.author?.userName || '用户')}
            >
              回复
            </Button>
            {/* 删除按钮 */}
            {canManage(reply.author?._id) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 h-6 px-2 text-xs hover:text-red-600"
                onClick={() => onDelete(reply._id)}
              >
                删除
              </Button>
            )}
          </div>
        </div>

        {/* 回复内容 */}
        <div
          className="text-slate-700 text-sm [&_p]:mb-1"
          dangerouslySetInnerHTML={{ __html: reply.content }}
        />

        {/* 子回复列表 */}
        {reply.children && reply.children.length > 0 && (
          <div className="mt-3 ml-11 space-y-3 border-l-2 border-slate-200 pl-4">
            {reply.children.map((child) => (
              <ReplyItem
                key={child._id}
                reply={child}
                rootReplyId={rootReplyId}
                onDelete={onDelete}
                canManage={canManage}
                onReply={onReply}
                isAccepted={false}
                canMarkSolution={false}
                onMarkSolution={() => {}}
                onLikeReply={() => {}}
                isLiked={false}
                replyLikeCount={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
