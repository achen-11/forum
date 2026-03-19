import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminLogApi } from '@/api/admin_log'
import { useAuthStore } from '@/stores/authStore'
import {
  Shield,
  Loader2,
  FileText,
  MessageSquare,
  Folder,
  Tag,
  User,
  ChevronDown,
} from 'lucide-react'

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
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [actionFilter, setActionFilter] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'

  const fetchLogs = async (pageNum: number = 1) => {
    setLoading(true)
    try {
      const res = await adminLogApi.getLogList({
        page: pageNum,
        pageSize: 20,
        action: actionFilter || undefined,
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

  const handleFilterChange = () => {
    fetchLogs(1)
  }

  const clearFilters = () => {
    setActionFilter('')
    setTargetTypeFilter('')
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <ChevronDown className="w-4 h-4 mr-1" />
                  筛选
                </Button>
                {(actionFilter || targetTypeFilter) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    清除筛选
                  </Button>
                )}
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="flex items-center gap-4 mt-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">操作类型</label>
                  <select
                    value={actionFilter}
                    onChange={(e) => {
                      setActionFilter(e.target.value)
                    }}
                    onBlur={handleFilterChange}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">全部</option>
                    <option value="POST_DELETE">删除帖子</option>
                    <option value="POST_PIN">置顶帖子</option>
                    <option value="POST_UNPIN">取消置顶</option>
                    <option value="REPLY_DELETE">删除回复</option>
                    <option value="CATEGORY_CREATE">创建分类</option>
                    <option value="CATEGORY_UPDATE">更新分类</option>
                    <option value="CATEGORY_DELETE">删除分类</option>
                    <option value="TAG_CREATE">创建标签</option>
                    <option value="TAG_UPDATE">更新标签</option>
                    <option value="TAG_DELETE">删除标签</option>
                    <option value="USER_ROLE_CHANGE">变更角色</option>
                    <option value="USER_BAN">封禁用户</option>
                    <option value="USER_UNBAN">解封用户</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">对象类型</label>
                  <select
                    value={targetTypeFilter}
                    onChange={(e) => {
                      setTargetTypeFilter(e.target.value)
                    }}
                    onBlur={handleFilterChange}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">全部</option>
                    <option value="post">帖子</option>
                    <option value="reply">回复</option>
                    <option value="category">分类</option>
                    <option value="tag">标签</option>
                    <option value="user">用户</option>
                  </select>
                </div>
              </div>
            )}

            <p className="text-sm text-slate-500 mt-2">共 {total} 条记录</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                暂无日志数据
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log._id}
                      className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {TARGET_TYPE_ICONS[log.targetType] || <FileText className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getActionColor(log.action)}>
                            {ACTION_LABELS[log.action] || log.action}
                          </Badge>
                          <Badge variant="outline">
                            {TARGET_TYPE_LABELS[log.targetType] || log.targetType}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {TARGET_TYPE_LABELS[log.targetType] || log.targetType} ID: {log.targetId.slice(0, 8)}...
                          </span>
                        </div>
                        {formatDetail(log.action, log.detail) && (
                          <p className="text-sm text-slate-600 mt-2">{formatDetail(log.action, log.detail)}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                          <span>操作者: {log.operatorName}</span>
                          <span>操作时间: {new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => fetchLogs(page - 1)}
                    >
                      上一页
                    </Button>
                    <span className="text-sm text-slate-500">
                      第 {page} / {totalPages} 页
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => fetchLogs(page + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
