import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { UserAvatar } from '@/components/UserAvatar'
import {
  ChevronDown,
  Crown,
  Shield,
  LogOut,
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  Users,
  ScrollText,
} from 'lucide-react'
import { useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

const adminMenuItems = [
  {
    title: '概览',
    icon: LayoutDashboard,
    path: '/admin',
  },
  {
    title: '内容管理',
    icon: FileText,
    path: '/admin/content',
  },
  {
    title: '分类管理',
    icon: FolderOpen,
    path: '/admin/category',
  },
  {
    title: '标签管理',
    icon: Tags,
    path: '/admin/tag',
  },
  {
    title: '用户管理',
    icon: Users,
    path: '/admin/user',
  },
  {
    title: '操作日志',
    icon: ScrollText,
    path: '/admin/log',
  },
]

function AdminSidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const isMobile = useIsMobile()

  const handleLogout = async () => {
    setShowUserMenu(false)
    await logout()
  }

  const getRoleBadge = (role: string) => {
    if (role === 'superadmin') {
      return <Badge className="bg-amber-500 hover:bg-amber-600 gap-1 text-xs"><Crown className="w-3 h-3" /> 超级管理员</Badge>
    }
    if (role === 'admin') {
      return <Badge className="bg-indigo-500 hover:bg-indigo-600 gap-1 text-xs"><Shield className="w-3 h-3" /> 管理员</Badge>
    }
    return null
  }

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-sidebar-border">
        <div className="flex items-center gap-2 px-2 h-14">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="font-semibold text-sidebar-foreground truncate">
            Kooboo Forum
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/50">
            管理功能
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => {
                // For dashboard, check if path is /admin and location is exactly /admin
                const isActive = item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname === item.path
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.path}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className=" border-sidebar-border">
        <div className="p-2">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors"
            >
              <UserAvatar user={user ?? {}} size="sm" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.displayName || user?.userName || '用户'}
                </p>
                <div className="flex items-center gap-1">
                  {getRoleBadge(user?.role || 'user')}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-sidebar-foreground/50" />
            </button>

            {showUserMenu && (
              <div className={`
                absolute bottom-full left-0 mb-1 w-full bg-sidebar rounded-md shadow-lg border border-sidebar-border py-1 z-50
                ${isMobile ? '' : ''}
              `}>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  返回前台
                </Link>
                <SidebarSeparator className="my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-sidebar-accent w-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function SiteHeader() {
  const location = useLocation()

  // Get page title based on current path
  const getPageTitle = () => {
    const currentItem = adminMenuItems.find(item => {
      if (item.path === '/admin') {
        return location.pathname === '/admin'
      }
      return location.pathname === item.path
    })
    return currentItem?.title || '管理后台'
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger />
      <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
    </header>
  )
}

export default function AdminLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-svh w-full">
        <AdminSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <SiteHeader />
          <div className="flex-1 overflow-auto bg-muted/30 p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
