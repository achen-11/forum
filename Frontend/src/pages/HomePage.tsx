import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { usePostStore } from '@/stores/postStore'
import { HomeSidebar } from '@/components/HomeSidebar'
import { PostList } from '@/components/PostList'
import { Header } from '@/components/Header'
import { Plus } from 'lucide-react'

type SortOption = 'recent' | 'popular' | 'unanswered'

export default function HomePage() {
  const navigate = useNavigate()
  const { categories, tags, selectedCategoryId, fetchCategories, fetchTags, fetchPosts, setSelectedCategory } = usePostStore()
  const [sortBy, setSortBy] = useState<SortOption>('recent')

  useEffect(() => {
    fetchCategories()
    fetchTags()
    fetchPosts()
  }, [fetchCategories, fetchTags, fetchPosts])

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      {/* Header - 使用共享组件 */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧边栏 */}
          <HomeSidebar
            categories={categories}
            tags={tags}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategory}
          />

          {/* 右侧帖子列表 */}
          <section className="flex-1 space-y-6 my-8">
            {/* 筛选栏 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`text-sm font-semibold pb-1 ${
                    sortBy === 'recent'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  最新
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`text-sm font-medium pb-1 ${
                    sortBy === 'popular'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  热门
                </button>
                <button
                  onClick={() => setSortBy('unanswered')}
                  className={`text-sm font-medium pb-1 ${
                    sortBy === 'unanswered'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  待回复
                </button>
              </div>
              <Button
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => navigate('/post/new')}
              >
                <Plus className="w-4 h-4" />
                发帖
              </Button>
            </div>

            {/* 帖子列表 */}
            <PostList />
          </section>
        </div>
      </main>
    </div>
  )
}
