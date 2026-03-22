import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminTable } from '@/components/AdminTable'
import { adminLogApi } from '@/api/admin_log'
import { useAuthStore } from '@/stores/authStore'
import {
  Shield,
  FileText,
  MessageSquare,
  Folder,
  Tag,
  User,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LogEntry {
  _id: string
  operatorId: string
  operatorName: string
  action: string
  targetType: string
  targetId: string
  detail: Record<string, any> | null
  createdAt: string
}

// 操作类型映射
const ACTION_LABELS: Record<string, string> = {
  POST_DELETE: '删除帖子',
  POST_PIN: '置顶帖子',
  POST_UNPIN: '取消置顶',
  REPLY_DELETE: '删除回复',
  CATEGORY_CREATE: '创建分类',
  CATEGORY_UPDATE: '更新分类',
  CATEGORY_DELETE: '删除分类',
  TAG_CREATE: '创建标签',
  TAG_UPDATE: '更新标签',
  TAG_DELETE: '删除标签',
  USER_ROLE_CHANGE: '变更角色',
  USER_BAN: '封禁用户',
  USER_UNBAN: '解封用户',
}

// 对象类型映射
const TARGET_TYPE_ICONS: Record<string, React.ReactNode> = {
  post: <FileText className="w-4 h-4" />,
  reply: <MessageSquare className="w-4 h-4" />,
  category: <Folder className="w-4 h-4" />,
  tag: <Tag className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
}

const TARGET_TYPE_LABELS: Record<string, string> = {
  post: '帖子',
  reply: '回复',
  category: '分类',
  tag: '标签',
  user: '用户',
}

// 获取操作类型颜色
function getActionColor(action: string): string {
  if (action.includes('DELETE')) return 'bg-red-100 text-red-700'
  if (action.includes('BAN')) return 'bg-orange-100 text-orange-700'
  if (action.includes('PIN')) return 'bg-indigo-100 text-indigo-700'
  if (action.includes('ROLE')) return 'bg-blue-100 text-blue-700'
  if (action.includes('CREATE')) return 'bg-green-100 text-green-700'
  return 'bg-slate-100 text-slate-700'
}

export default function AdminLogPage() {
  const { user: currentUser } = useAuthStore()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [actionFilter, setActionFilter] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState('')

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'

  const fetchLogs = async (pageNum: number = 1, pageSizeNum: number = pageSize) => {
    setLoading(true)
    try {
      const res = await adminLogApi.getLogList({
        page: pageNum,
        pageSize: pageSizeNum,
        actionType: actionFilter || undefined,
        targetType: targetTypeFilter || undefined,
      })
      setLogs(res.list)
      setPage(res.pagination.page)
      setTotalPages(res.pagination.totalPages)
      setTotal(res.pagination.total)
    } catch (err: any) {
      toast.error(err.message || '获取日志列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    fetchLogs()
  }, [isAdmin, actionFilter, targetTypeFilter])

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize)
    }
    fetchLogs(newPage, newPageSize || pageSize)
  }

  const handleFilterChange = () => {
    setPage(1)
    fetchLogs(1, pageSize)
  }

  const formatDetail = (action: string, detail: Record<string, any> | null): string => {
    if (!detail) return ''
    switch (action) {
      case 'POST_DELETE':
        return detail.title ? `帖子: ${detail.title.slice(0, 30)}${detail.title.length > 30 ? '...' : ''}` : ''
      case 'POST_PIN':
      case 'POST_UNPIN':
        return detail.title ? `帖子: ${detail.title.slice(0, 30)}${detail.title.length > 30 ? '...' : ''}` : ''
      case 'CATEGORY_CREATE':
      case 'CATEGORY_UPDATE':
      case 'CATEGORY_DELETE':
        return detail.name ? `分类: ${detail.name}` : ''
      case 'TAG_CREATE':
      case 'TAG_UPDATE':
      case 'TAG_DELETE':
        return detail.name ? `标签: ${detail.name}` : ''
      case 'USER_ROLE_CHANGE':
        return detail.targetDisplayName ? `用户: ${detail.targetDisplayName} → ${detail.targetRole}` : ''
      case 'USER_BAN':
      case 'USER_UNBAN':
        return detail.targetDisplayName ? `用户: ${detail.targetDisplayName}` : ''
      default:
        return ''
    }
  }

  const columns: ColumnDef<LogEntry>[] = [
    {
      accessorKey: 'action',
      header: '操作类型',
      cell: ({ row }) => (
        <Badge className={getActionColor(row.original.action)}>
          {ACTION_LABELS[row.original.action] || row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: 'targetType',
      header: '对象类型',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {TARGET_TYPE_ICONS[row.original.targetType] || <FileText className="w-4 h-4" />}
          <span>{TARGET_TYPE_LABELS[row.original.targetType] || row.original.targetType}</span>
        </div>
      ),
    },
    {
      accessorKey: 'detail',
      header: '明细',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDetail(row.original.action, row.original.detail)}
        </span>
      ),
    },
    {
      accessorKey: 'operatorName',
      header: '操作者',
      cell: ({ row }) => row.original.operatorName,
    },
    {
      accessorKey: 'createdAt',
      header: '操作时间',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'targetId',
      header: '对象ID',
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {row.original.targetId.slice(0, 8)}...
        </code>
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
            <CardTitle>日志列表</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={actionFilter || '__all__'} onValueChange={(v) => { setActionFilter(v === '__all__' ? '' : v); handleFilterChange(); }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="操作类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">全部</SelectItem>
                  <SelectItem value="POST_DELETE">删除帖子</SelectItem>
                  <SelectItem value="POST_PIN">置顶帖子</SelectItem>
                  <SelectItem value="POST_UNPIN">取消置顶</SelectItem>
                  <SelectItem value="CATEGORY_CREATE">创建分类</SelectItem>
                  <SelectItem value="CATEGORY_UPDATE">更新分类</SelectItem>
                  <SelectItem value="CATEGORY_DELETE">删除分类</SelectItem>
                  <SelectItem value="TAG_CREATE">创建标签</SelectItem>
                  <SelectItem value="TAG_UPDATE">更新标签</SelectItem>
                  <SelectItem value="TAG_DELETE">删除标签</SelectItem>
                  <SelectItem value="USER_ROLE_CHANGE">变更角色</SelectItem>
                  <SelectItem value="USER_BAN">封禁用户</SelectItem>
                  <SelectItem value="USER_UNBAN">解封用户</SelectItem>
                </SelectContent>
              </Select>
              <Select value={targetTypeFilter || '__all__'} onValueChange={(v) => { setTargetTypeFilter(v === '__all__' ? '' : v); handleFilterChange(); }}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="对象类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">全部</SelectItem>
                  <SelectItem value="post">帖子</SelectItem>
                  <SelectItem value="reply">回复</SelectItem>
                  <SelectItem value="category">分类</SelectItem>
                  <SelectItem value="tag">标签</SelectItem>
                  <SelectItem value="user">用户</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-2">共 {total} 条记录</p>
        </CardHeader>
        <CardContent>
          <AdminTable
            columns={columns}
            data={logs}
            loading={loading}
            globalFilterPlaceholder="搜索日志..."
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
    </div>
  )
}
