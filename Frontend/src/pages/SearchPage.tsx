import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { usePostStore } from '@/stores/postStore'
import { postApi } from '@/api/post'
import { HomeSidebar } from '@/components/HomeSidebar'
import { Header } from '@/components/Header'
import { Plus, X, Search, Hash, Folder } from 'lucide-react'
import type { Post, SearchPagination } from '@/types/post'

type SortOption = 'recent' | 'popular' | 'unanswered'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN')
}

function SearchPostItem({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 cursor-pointer hover:shadow-md transition-all group"
    >
      <div className="flex gap-4">
        <div className="shrink-0">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-slate-600 font-medium">
              {(post.author?.displayName || post.author?.userName || '?').slice(0, 1).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-medium text-slate-900 group-hover:text-indigo-600">
                {post.author?.displayName || post.author?.userName || '匿名用户'}
              </span>
              <span>·</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
            {post.isPinned && (
              <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                置顶
              </div>
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
            {post.title}
          </h3>
          {post.summary && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{post.summary}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.category && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                  {post.category.name}
                </span>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag._id}
                      className="px-2 py-0.5 text-xs rounded-full text-white"
                      style={{ backgroundColor: tag.color || '#6366f1' }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>{post.viewCount || 0} 浏览</span>
              <span>{post.replyCount || 0} 回复</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function FilterTag({ icon: Icon, label, onRemove }: {
  icon: React.ElementType
  label: string
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
      <button onClick={onRemove} className="ml-1 p-0.5 hover:bg-indigo-100 rounded" title="清除">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { categories, tags, fetchCategories, fetchTags, setSelectedCategory } = usePostStore()

  const keyword = searchParams.get('keyword') || ''
  const tag = searchParams.get('tag') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState<SearchPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('recent')

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [fetchCategories, fetchTags])

  // Sync category from URL to store
  useEffect(() => {
    setSelectedCategory(categoryId || null)
  }, [categoryId, setSelectedCategory])

  // Search/filter
  useEffect(() => {
    setIsLoading(true)

    const doSearch = async () => {
      try {
        if (keyword) {
          const res = await postApi.searchPosts(keyword, categoryId || undefined, page, 10)
          setPosts(res.list)
          setPagination(res.pagination)
        } else if (tag) {
          const res = await postApi.searchPosts('', categoryId || undefined, page, 10, tag)
          setPosts(res.list)
          setPagination(res.pagination)
        } else if (categoryId) {
          const res = await postApi.getPostList(categoryId)
          setPosts(res.list)
          setPagination(null)
        } else {
          const res = await postApi.getPostList()
          setPosts(res.list)
          setPagination(null)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    doSearch()
  }, [keyword, tag, categoryId, page])

  // Build URL with existing params
  const buildUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    const qs = params.toString()
    return qs ? `/search?${qs}` : '/search'
  }

  const handleClearAll = () => navigate('/')
  const handleRemoveKeyword = () => navigate(buildUrl({ keyword: null }))
  const handleRemoveTag = () => navigate(buildUrl({ tag: null }))
  const handleRemoveCategory = () => navigate(buildUrl({ categoryId: null }))

  // Handle category click from sidebar
  const handleCategorySelect = (id: string | null) => {
    setSelectedCategory(id)
    navigate(buildUrl({ categoryId: id }))
  }

  const hasFilter = keyword || tag || categoryId
  const filterCount = [keyword ? 1 : 0, tag ? 1 : 0, categoryId ? 1 : 0].reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <Header />
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-80px)]">
          <HomeSidebar
            categories={categories}
            tags={tags}
            selectedCategoryId={categoryId || null}
            onSelectCategory={handleCategorySelect}
          />
          <section className="flex-1 space-y-6 my-8">
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
              <Button className="gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/post/new')}>
                <Plus className="w-4 h-4" />
                发帖
              </Button>
            </div>

            {/* First row: Filter tags */}
            {hasFilter && (
              <div className="flex items-center gap-2 flex-wrap">
                {keyword && (
                  <FilterTag icon={Search} label={`搜索: ${keyword}`} onRemove={handleRemoveKeyword} />
                )}
                {tag && (
                  <FilterTag icon={Hash} label={`标签: ${tag}`} onRemove={handleRemoveTag} />
                )}
                {categoryId && (
                  <FilterTag
                    icon={Folder}
                    label={`分类: ${categories.find(c => c._id === categoryId)?.name || '未知'}`}
                    onRemove={handleRemoveCategory}
                  />
                )}
                {filterCount > 1 && (
                  <button onClick={handleClearAll} className="text-sm text-slate-500 hover:text-slate-700 underline">
                    清除全部
                  </button>
                )}
              </div>
            )}

            {/* Results */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400">未找到相关帖子</p>
                <p className="text-sm text-slate-400 mt-1">试试其他关键词或筛选条件</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <SearchPostItem key={post._id} post={post} onClick={() => navigate(`/post/${post._id}`)} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams)
                    params.set('page', String(page - 1))
                    navigate(`/search?${params.toString()}`)
                  }}
                >
                  上一页
                </Button>
                <span className="px-4 py-2 text-sm text-slate-500">{page} / {pagination.totalPages}</span>
                <Button
                  variant="outline"
                  disabled={page >= pagination.totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams)
                    params.set('page', String(page + 1))
                    navigate(`/search?${params.toString()}`)
                  }}
                >
                  下一页
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
