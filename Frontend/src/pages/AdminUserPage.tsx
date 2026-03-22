import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminTable } from '@/components/AdminTable'
import { adminUserApi } from '@/api/admin_user'
import { useAuthStore } from '@/stores/authStore'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Crown,
  Shield,
  User as UserIcon,
  Ban,
  CheckCircle,
  Search,
} from 'lucide-react'

interface User {
  _id: string
  userName: string
  displayName: string
  email: string
  phone: string
  avatar: string
  role: string
  isBanned: boolean
  createdAt: string
  lastLoginAt: string
}

export default function AdminUserPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [banUserId, setBanUserId] = useState<string | null>(null)
  const [unbanUserId, setUnbanUserId] = useState<string | null>(null)
  const [roleUserId, setRoleUserId] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<string>('')

  const isSuperAdmin = currentUser?.role === 'superadmin'
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'

  const fetchUsers = async (pageNum: number = 1, searchKeyword: string = keyword, pageSizeNum: number = pageSize) => {
    setLoading(true)
    try {
      const res = await adminUserApi.getUserList({
        page: pageNum,
        pageSize: pageSizeNum,
        keyword: searchKeyword,
      })
      setUsers(res.list)
      setPage(res.pagination.page)
      setTotalPages(res.pagination.totalPages)
      setTotal(res.pagination.total)
    } catch (err: any) {
      toast.error(err.message || '获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    fetchUsers()
  }, [isAdmin])

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    setPage(1)
    fetchUsers(1, keyword, pageSize)
  }

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize)
    }
    fetchUsers(newPage, keyword, newPageSize || pageSize)
  }

  const handleBanUser = async () => {
    if (!banUserId) return
    try {
      await adminUserApi.banUser(banUserId)
      toast.success('封禁成功')
      setBanUserId(null)
      fetchUsers(page, keyword, pageSize)
    } catch (err: any) {
      toast.error(err.message || '封禁失败')
    }
  }

  const handleUnbanUser = async () => {
    if (!unbanUserId) return
    try {
      await adminUserApi.unbanUser(unbanUserId)
      toast.success('解封成功')
      setUnbanUserId(null)
      fetchUsers(page, keyword, pageSize)
    } catch (err: any) {
      toast.error(err.message || '解封失败')
    }
  }

  const handleChangeRole = async () => {
    if (!roleUserId || !newRole) return
    try {
      await adminUserApi.changeRole(roleUserId, newRole)
      toast.success('角色变更成功')
      setRoleUserId(null)
      setNewRole('')
      fetchUsers(page, keyword, pageSize)
    } catch (err: any) {
      toast.error(err.message || '角色变更失败')
    }
  }

  const openRoleDialog = (user: User) => {
    setRoleUserId(user._id)
    setNewRole(user.role === 'admin' ? 'user' : 'admin')
  }

  const getRoleBadge = (role: string) => {
    if (role === 'superadmin') {
      return <Badge className="bg-amber-500 hover:bg-amber-600 gap-1"><Crown className="w-3 h-3" /> 超级管理员</Badge>
    }
    if (role === 'admin') {
      return <Badge className="bg-indigo-500 hover:bg-indigo-600 gap-1"><Shield className="w-3 h-3" /> 管理员</Badge>
    }
    return <Badge variant="outline"><UserIcon className="w-3 h-3 mr-1" /> 用户</Badge>
  }

  const canChangeRole = (user: User) => {
    if (!isSuperAdmin) return false
    if (user._id === currentUser?._id) return false
    if (user.role === 'superadmin') return false
    return true
  }

  const canBan = (user: User) => {
    if (user._id === currentUser?._id) return false
    if (user.role === 'superadmin') return false
    if (user.role === 'admin' && !isSuperAdmin) return false
    return isAdmin
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'displayName',
      header: '用户',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            {row.original.avatar ? (
              <img src={row.original.avatar} alt="" className="w-full h-full rounded-full" />
            ) : (
              <span className="text-indigo-600 font-semibold text-sm">
                {(row.original.displayName || row.original.userName || '?').slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{row.original.displayName || row.original.userName}</span>
              {getRoleBadge(row.original.role)}
              {row.original.isBanned && (
                <Badge className="bg-red-500 hover:bg-red-600 gap-1">
                  <Ban className="w-3 h-3" /> 已封禁
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">@{row.original.userName}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: '邮箱',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      accessorKey: 'createdAt',
      header: '注册时间',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'lastLoginAt',
      header: '最后登录',
      cell: ({ row }) => row.original.lastLoginAt
        ? new Date(row.original.lastLoginAt).toLocaleDateString()
        : '-',
      sortingFn: 'datetime',
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {canChangeRole(row.original) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openRoleDialog(row.original)}
            >
              {row.original.role === 'admin' ? '降为用户' : '升为管理员'}
            </Button>
          )}
          {canBan(row.original) && (
            row.original.isBanned ? (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => setUnbanUserId(row.original._id)}
              >
                <CheckCircle className="w-4 h-4" />
                解封
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setBanUserId(row.original._id)}
              >
                <Ban className="w-4 h-4" />
                封禁
              </Button>
            )
          )}
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
            <CardTitle>用户列表</CardTitle>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索用户名、昵称、邮箱..."
                  className="w-64 pl-8"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                搜索
              </Button>
            </form>
          </div>
          <p className="text-sm text-slate-500 mt-2">共 {total} 个用户</p>
        </CardHeader>
        <CardContent>
          <AdminTable
            columns={columns}
            data={users}
            loading={loading}
            globalFilterPlaceholder="搜索用户..."
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

      {/* Ban Confirmation Dialog */}
      <ConfirmDialog
        open={!!banUserId}
        onOpenChange={() => setBanUserId(null)}
        title="封禁用户"
        description="确定要封禁这个用户吗？被封禁的用户将无法登录。"
        confirmText="封禁"
        variant="destructive"
        onConfirm={handleBanUser}
      />

      {/* Unban Confirmation Dialog */}
      <ConfirmDialog
        open={!!unbanUserId}
        onOpenChange={() => setUnbanUserId(null)}
        title="解封用户"
        description="确定要解封这个用户吗？解封后用户可以正常登录。"
        confirmText="解封"
        onConfirm={handleUnbanUser}
      />

      {/* Role Change Dialog */}
      <ConfirmDialog
        open={!!roleUserId}
        onOpenChange={() => {
          setRoleUserId(null)
          setNewRole('')
        }}
        title="变更用户角色"
        description={newRole === 'admin' ? '确定要将该用户提升为管理员吗？' : '确定要将该管理员降为普通用户吗？'}
        confirmText="确认"
        onConfirm={handleChangeRole}
      />
    </div>
  )
}
