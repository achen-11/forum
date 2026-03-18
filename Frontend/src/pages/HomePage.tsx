import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { usePostStore } from '@/stores/postStore'
import { HomeSidebar } from '@/components/HomeSidebar'
import { PostList } from '@/components/PostList'
import { Header } from '@/components/Header'
import { CreatePostDrawer } from '@/components/CreatePostDrawer'
import { Plus, X, Folder } from 'lucide-react'

type SortOption = 'recent' | 'popular' | 'unanswered'

export default function HomePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { categories, tags, selectedCategoryId, fetchCategories, fetchTags, fetchPosts, setSelectedCategory } = usePostStore()
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const categoryParam = searchParams.get('category')

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [fetchCategories, fetchTags])

  // Sync category from URL to store
  useEffect(() => {
    if (categoryParam && categoryParam !== selectedCategoryId) {
      setSelectedCategory(categoryParam)
    }
  }, [categoryParam, setSelectedCategory])

  useEffect(() => {
    if (!categoryParam) {
      fetchPosts()
    } else {
      fetchPosts(categoryParam)
    }
  }, [categoryParam, fetchPosts])

  const handleClearCategory = () => {
    setSelectedCategory(null)
    navigate('/')
  }

  const getSelectedCategoryName = () => {
    if (!selectedCategoryId) return null
    const cat = categories.find(c => c._id === selectedCategoryId)
    return cat?.name || null
  }

  const selectedCategoryName = getSelectedCategoryName()
  const hasFilter = selectedCategoryId && selectedCategoryName

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <Header />
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <HomeSidebar
            categories={categories}
            tags={tags}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => {
              setSelectedCategory(id)
              if (id) {
                navigate(`/?category=${id}`)
              } else {
                navigate('/')
              }
            }}
          />
          <section className="flex-1 space-y-6 my-8">
            {/* First row: Filter tags */}
            {hasFilter && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                  <Folder className="w-4 h-4" />
                  <span className="font-medium">分类: {selectedCategoryName}</span>
                  <button
                    onClick={handleClearCategory}
                    className="ml-2 p-0.5 hover:bg-indigo-100 rounded"
                    title="清除筛选"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Second row: Sort tabs and post button */}
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`text-sm font-semibold pb-1 ${sortBy === 'recent' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  最新
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`text-sm font-medium pb-1 ${sortBy === 'popular' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  热门
                </button>
                <button
                  onClick={() => setSortBy('unanswered')}
                  className={`text-sm font-medium pb-1 ${sortBy === 'unanswered' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  待回复
                </button>
              </div>
              <Button className="gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsDrawerOpen(true)}>
                <Plus className="w-4 h-4" />
                发帖
              </Button>
            </div>

            <PostList />
          </section>
        </div>
      </main>

      <CreatePostDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} mode="create" />
    </div>
  )
}
