import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { usePostStore } from '@/stores/postStore'
import { CategorySidebar } from '@/components/CategorySidebar'
import { PostList } from '@/components/PostList'
import { Plus } from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { categories, selectedCategoryId, fetchCategories, fetchPosts, setSelectedCategory } = usePostStore()

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [fetchCategories, fetchPosts])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">内部论坛</h1>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                className="gap-1.5 bg-slate-900 hover:bg-slate-800"
                onClick={() => navigate('/post/new')}
              >
                <Plus className="w-4 h-4" />
                发帖
              </Button>
              <Link
                to="/profile"
                className="text-sm text-slate-600 hidden sm:block hover:text-slate-900 hover:underline"
              >
                {user?.displayName || user?.userName || '用户'}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* 左侧分类栏 */}
          <CategorySidebar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategory}
          />

          {/* 右侧帖子列表 */}
          <div className="flex-1">
            <PostList />
          </div>
        </div>
      </main>
    </div>
  )
}
