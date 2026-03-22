import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDashboardStats, DashboardStats } from '@/api/admin_stats'
import { useAuthStore } from '@/stores/authStore'
import {
  FileText,
  Users,
  FolderOpen,
  Tags,
  Crown,
  Shield,
  Loader2,
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  description: string
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  useEffect(() => {
    if (!isAdmin) return

    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [isAdmin])

  const getRoleBadge = (role: string) => {
    if (role === 'superadmin') {
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 gap-1">
          <Crown className="w-3 h-3" />
          超级管理员
        </Badge>
      )
    }
    if (role === 'admin') {
      return (
        <Badge className="bg-indigo-500 hover:bg-indigo-600 gap-1">
          <Shield className="w-3 h-3" />
          管理员
        </Badge>
      )
    }
    return null
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">欢迎回来</h1>
          <p className="text-muted-foreground">
            {user?.displayName || user?.userName}，这里是管理后台概览
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getRoleBadge(user?.role || 'user')}
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="帖子总数"
            value={stats.postCount}
            icon={FileText}
            description="论坛中的全部帖子"
          />
          <StatCard
            title="用户总数"
            value={stats.userCount}
            icon={Users}
            description="已注册的用户数"
          />
          <StatCard
            title="分类总数"
            value={stats.categoryCount}
            icon={FolderOpen}
            description="论坛帖子分类"
          />
          <StatCard
            title="标签总数"
            value={stats.tagCount}
            icon={Tags}
            description="帖子使用的标签"
          />
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          暂无统计数据
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              使用左侧菜单访问各个管理模块
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">系统信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">当前用户</span>
                <span className="font-medium">{user?.displayName || user?.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">用户角色</span>
                <span className="font-medium">{user?.role === 'superadmin' ? '超级管理员' : user?.role === 'admin' ? '管理员' : '普通用户'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
