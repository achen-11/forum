import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminUserApi } from '@/api/admin_user'
import { useAuthStore } from '@/stores/authStore'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Crown,
  Shield,
  User as UserIcon,
  Loader2,
  Search,
  Ban,
  CheckCircle,
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
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [banUserId, setBanUserId] = useState<string | null>(null)
  const [unbanUserId, setUnbanUserId] = useState<string | null>(null)
  const [roleUserId, setRoleUserId] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<string>('')

  const isSuperAdmin = currentUser?.role === 'superadmin'
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'

  const fetchUsers = async (pageNum: number = 1, searchKeyword: string = keyword) => {
    setLoading(true)
    try {
      const res = await adminUserApi.getUserList({
        page: pageNum,
        pageSize: 20,
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(1, keyword)
  }

  const handleBanUser = async () => {
    if (!banUserId) return
    try {
      await adminUserApi.banUser(banUserId)
      toast.success('封禁成功')
      setBanUserId(null)
      fetchUsers(page, keyword)
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
      fetchUsers(page, keyword)
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
      fetchUsers(page, keyword)
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
    // 只有超级管理员可以变更角色
    if (!isSuperAdmin) return false
    // 不能修改自己
    if (user._id === currentUser?._id) return false
    // 不能修改超级管理员
    if (user.role === 'superadmin') return false
    return true
  }

  const canBan = (user: User) => {
    // 不能封禁自己
    if (user._id === currentUser?._id) return false
    // 不能封禁超级管理员
    if (user.role === 'superadmin') return false
    // 不能封禁管理员（除非是超级管理员）
    if (user.role === 'admin' && !isSuperAdmin) return false
    return isAdmin
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#f6f6f8]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">用户管理</h1>
          <div className="flex items-center gap-2">
            {getRoleBadge(currentUser?.role || 'user')}
            <span className="text-sm text-slate-600">{currentUser?.displayName}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>用户列表</CardTitle>
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索用户名、昵称、邮箱..."
                  className="w-64"
                />
                <Button type="submit" variant="outline" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>
            <p className="text-sm text-slate-500 mt-2">共 {total} 个用户</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                暂无用户数据
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full rounded-full" />
                          ) : (
                            <span className="text-indigo-600 font-semibold">
                              {(user.displayName || user.userName || '?').slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-800">{user.displayName || user.userName}</p>
                            {getRoleBadge(user.role)}
                            {user.isBanned && (
                              <Badge className="bg-red-500 hover:bg-red-600 gap-1">
                                <Ban className="w-3 h-3" /> 已封禁
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                            <span>@{user.userName}</span>
                            {user.email && <span>{user.email}</span>}
                            <span>注册于 {new Date(user.createdAt).toLocaleDateString()}</span>
                            {user.lastLoginAt && (
                              <span>最后登录 {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {canChangeRole(user) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRoleDialog(user)}
                          >
                            {user.role === 'admin' ? '降为用户' : '升为管理员'}
                          </Button>
                        )}
                        {canBan(user) && (
                          user.isBanned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => setUnbanUserId(user._id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                              解封
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setBanUserId(user._id)}
                            >
                              <Ban className="w-4 h-4" />
                              封禁
                            </Button>
                          )
                        )}
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
                      onClick={() => fetchUsers(page - 1, keyword)}
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
                      onClick={() => fetchUsers(page + 1, keyword)}
                    >
                      下一页
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

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
