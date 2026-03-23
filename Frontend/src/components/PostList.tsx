import { usePostStore } from '@/stores/postStore'
import { PostItem } from './PostItem'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export function PostList() {
  const { posts, isLoading, error } = usePostStore()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
        <p className="text-slate-400">暂无帖子</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostItem
          key={post._id}
          post={post}
          onClick={() => navigate(`/post/${post._id}`)}
        />
      ))}
    </div>
  )
}
