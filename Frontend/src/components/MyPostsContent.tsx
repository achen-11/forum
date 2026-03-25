import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { postApi } from '@/api/post'
import { useAuthStore } from '@/stores/authStore'
import { PostItem } from '@/components/PostItem'
import { EmptyState } from '@/components/EmptyState'
import { FileText } from 'lucide-react'
import type { Post } from '@/types/post'

export function MyPostsContent() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const PAGE_SIZE = 10

  // Load posts
  useEffect(() => {
    if (!user?._id) return
    let cancelled = false
    setLoading(true)

    postApi.getPostList(undefined, user._id, 1, PAGE_SIZE)
      .then((data) => {
        if (!cancelled) {
          setPosts(data.list)
          setPage(1)
          setTotalPages(data.pagination.totalPages)
        }
      })
      .catch(() => {
        if (!cancelled) setPosts([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?._id])

  // Load more
  const handleLoadMore = async () => {
    if (!user?._id || loadingMore) return
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const data = await postApi.getPostList(undefined, user._id, nextPage, PAGE_SIZE)
      setPosts(prev => [...prev, ...data.list])
      setPage(nextPage)
      setTotalPages(data.pagination.totalPages)
    } catch {
      // Keep existing posts on error
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="暂无发帖"
        description="你还没有发布任何帖子，快去发帖吧！"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">我的帖子</h2>
        <span className="text-sm text-slate-500">{posts.length} 条帖子</span>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <PostItem
            key={post._id}
            post={post}
            onClick={() => navigate(`/post/${post._id}`)}
          />
        ))}
      </div>

      {page < totalPages && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="gap-2"
          >
            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
            加载更多
          </Button>
        </div>
      )}
    </div>
  )
}