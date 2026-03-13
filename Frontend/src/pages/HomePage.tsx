import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'

export default function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">内部论坛</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              欢迎，{user?.displayName || user?.userName || '用户'}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              退出登录
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - 占位 */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>首页 - 帖子列表</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              帖子列表功能开发中，敬请期待...
            </p>
            <div className="text-sm text-muted-foreground">
              <p>当前用户信息：</p>
              <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
