import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminTable } from '@/components/AdminTable'
import { adminContentApi } from '@/api/admin_content'
import { useAuthStore } from '@/stores/authStore'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Trash2,
  Pin,
  PinOff,
  MessageSquare,
  Eye,
  ThumbsUp,
  Crown,
  Shield,
} from 'lucide-react'

interface Post {
  _id: string
  title: string
  content: string
  summary: string
  viewCount: number
  replyCount: number
  likeCount: number
  isPinned: boolean
  isEdited: boolean
  editedAt?: number
  isDeleted: boolean
  createdAt: string
  author: {
    _id: string
    userName: string
    displayName: string
    avatar: string
    role: string
  }
  category: {
    _id: string
    name: string
  } | null
}

export default function AdminContentPage() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const [pinPostId, setPinPostId] = useState<string | null>(null)

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const fetchPosts = async (pageNum: number = 1, pageSizeNum: number = pageSize) => {
    setLoading(true)
    try {
      const res = await adminContentApi.getPostList({ page: pageNum, pageSize: pageSizeNum })
      setPosts(res.list)
      setPage(res.pagination.page)
      setTotalPages(res.pagination.totalPages)
      setTotal(res.pagination.total)
    } catch (err: any) {
      toast.error(err.message || '获取帖子列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    fetchPosts()
  }, [isAdmin])

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize)
    }
    fetchPosts(newPage, newPageSize || pageSize)
  }

  const handleDeletePost = async () => {
    if (!deletePostId) return
    try {
      await adminContentApi.deletePost(deletePostId)
      toast.success('删除成功')
      setDeletePostId(null)
      fetchPosts(page, pageSize)
    } catch (err: any) {
      toast.error(err.message || '删除失败')
    }
  }

  const handlePinPost = async (post: Post) => {
    try {
      await adminContentApi.pinPost(post._id, !post.isPinned)
      toast.success(post.isPinned ? '取消置顶成功' : '置顶成功')
      setPinPostId(null)
      fetchPosts(page, pageSize)
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  const getRoleBadge = (role: string) => {
    if (role === 'superadmin') {
      return <Badge className="bg-amber-500 hover:bg-amber-600 gap-1"><Crown className="w-3 h-3" /> 超级管理员</Badge>
    }
    if (role === 'admin') {
      return <Badge className="bg-indigo-500 hover:bg-indigo-600 gap-1"><Shield className="w-3 h-3" /> 管理员</Badge>
    }
    return null
  }

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: 'title',
      header: '标题',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 max-w-[300px]">
          {row.original.isPinned && <Pin className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
          <span className="truncate font-medium">{row.original.title}</span>
          {row.original.isEdited && (
            <Badge variant="outline" className="text-xs ml-1">已编辑</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'author.displayName',
      header: '作者',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.author.displayName}</span>
          {getRoleBadge(row.original.author.role)}
        </div>
      ),
    },
    {
      accessorKey: 'category.name',
      header: '分类',
      cell: ({ row }) => row.original.category?.name || '-',
    },
    {
      accessorKey: 'createdAt',
      header: '发布时间',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'viewCount',
      header: '浏览',
      cell: ({ row }) => (
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          {row.original.viewCount}
        </span>
      ),
    },
    {
      accessorKey: 'replyCount',
      header: '回复',
      cell: ({ row }) => (
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" />
          {row.original.replyCount}
        </span>
      ),
    },
    {
      accessorKey: 'likeCount',
      header: '点赞',
      cell: ({ row }) => (
        <span className="flex items-center gap-1">
          <ThumbsUp className="w-3.5 h-3.5" />
          {row.original.likeCount}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => setPinPostId(row.original._id)}
          >
            {row.original.isPinned ? (
              <><PinOff className="w-4 h-4" /> 取消置顶</>
            ) : (
              <><Pin className="w-4 h-4" /> 置顶</>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setDeletePostId(row.original._id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h2 className="text-lg font-semibold mb-2">无权限访问</h2>
            <p className="text-slate-500 text-sm">您没有管理员权限，无法访问此页面。</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>帖子列表</CardTitle>
            <span className="text-sm text-slate-500">共 {total} 篇帖子</span>
          </div>
        </CardHeader>
        <CardContent>
          <AdminTable
            columns={columns}
            data={posts}
            loading={loading}
            globalFilterPlaceholder="搜索标题..."
            pagination={{
              page,
              pageSize,
              total,
              totalPages,
            }}
            onPaginationChange={handlePageChange}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletePostId}
        onOpenChange={() => setDeletePostId(null)}
        title="删除帖子"
        description="确定要删除这篇帖子吗？此操作不可恢复，关联的回复也会被删除。"
        confirmText="删除"
        variant="destructive"
        onConfirm={handleDeletePost}
      />

      {/* Pin Confirmation Dialog */}
      <ConfirmDialog
        open={!!pinPostId}
        onOpenChange={() => setPinPostId(null)}
        title={posts.find(p => p._id === pinPostId)?.isPinned ? '取消置顶' : '置顶帖子'}
        description={posts.find(p => p._id === pinPostId)?.isPinned ? '确定要取消置顶这篇帖子吗？' : '确定要置顶这篇帖子吗？'}
        confirmText="确定"
        onConfirm={() => {
          const post = posts.find(p => p._id === pinPostId)
          if (post) handlePinPost(post)
        }}
      />
    </div>
  )
}
