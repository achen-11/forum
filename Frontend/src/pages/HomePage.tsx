import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { usePostStore } from '@/stores/postStore'
import { HomeSidebar } from '@/components/HomeSidebar'
import { PostList } from '@/components/PostList'
import { Header } from '@/components/Header'
import { CreatePostDrawer } from '@/components/CreatePostDrawer'
import { NotificationsContent } from '@/components/NotificationsContent'
import { MyPostsContent } from '@/components/MyPostsContent'
import { Plus, X, Folder } from 'lucide-react'

type SortOption = 'recent' | 'popular'
type ViewType = 'posts' | 'notifications' | 'my-posts'

export default function HomePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { categories, tags, selectedCategoryId, fetchCategories, fetchTags, fetchPosts, setSelectedCategory } = usePostStore()
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [view, setView] = useState<ViewType>('posts')

  const categoryParam = searchParams.get('category')
  const viewParam = searchParams.get('view') as ViewType | null

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [fetchCategories, fetchTags])

  // Sync view from URL
  useEffect(() => {
    if (viewParam === 'notifications' || viewParam === 'my-posts') {
      setView(viewParam)
    }
  }, [viewParam])

  // Sync category from URL to store
  useEffect(() => {
    if (categoryParam && categoryParam !== selectedCategoryId) {
      setSelectedCategory(categoryParam)
    }
  }, [categoryParam, setSelectedCategory])

  useEffect(() => {
    if (view === 'posts') {
      if (!categoryParam) {
        fetchPosts(undefined, sortBy)
      } else {
        fetchPosts(categoryParam, sortBy)
      }
    }
  }, [categoryParam, sortBy, view, fetchPosts])

  // Handle view change
  const handleViewChange = (newView: ViewType) => {
    setView(newView)
    // Update URL when switching to posts or my-posts
    if (newView === 'posts') {
      setSearchParams(prev => {
        prev.delete('view')
        return prev
      })
    } else if (newView === 'my-posts') {
      setSearchParams(prev => {
        prev.set('view', 'my-posts')
        return prev
      })
    }
  }

  // Handle "show all notifications" from Header
  const handleShowAllNotifications = () => {
    setView('notifications')
  }

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
      <Header onShowAllNotifications={handleShowAllNotifications} />
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <HomeSidebar
            categories={categories}
            tags={tags}
            selectedCategoryId={selectedCategoryId}
            currentView={view}
            onViewChange={handleViewChange}
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
            {view === 'posts' ? (
              <>
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
                  </div>
                  <Button className="gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsDrawerOpen(true)}>
                    <Plus className="w-4 h-4" />
                    发帖
                  </Button>
                </div>

                <PostList />
              </>
            ) : view === 'notifications' ? (
              <NotificationsContent />
            ) : (
              <MyPostsContent />
            )}
          </section>
        </div>
      </main>

      <CreatePostDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} mode="create" />
    </div>
  )
}
