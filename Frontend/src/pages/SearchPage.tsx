import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/authStore'
import { usePostStore } from '@/stores/postStore'
import { postApi } from '@/api/post'
import { HomeSidebar } from '@/components/HomeSidebar'
import { Bell, ChevronDown, Loader2, Search, ArrowLeft, MessageCircle, Heart, Pin, Bookmark } from 'lucide-react'
import type { Post, SearchPagination } from '@/types/post'

// 高亮关键词
function highlightKeyword(text: string, keyword: string): React.ReactNode {
  if (!keyword || !text) return text

  const parts = text.split(new RegExp(`(${keyword})`, 'gi'))
  if (parts.length === 1) return text

  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={i} className="bg-indigo-100 text-indigo-700 p-1 mx-0.5 rounded font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

// 格式化日期
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

// 搜索结果项（带高亮）
function SearchPostItem({ post, keyword, onClick }: { post: Post; keyword: string; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer hover:shadow-md transition-all group ${
        post.isPinned ? 'border-indigo-200 hover:border-indigo-300' : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      <div className="flex gap-4">
        <div className="shrink-0">
          <Avatar className="w-10 h-10">
            {post.author?.avatar ? (
              <AvatarImage src={post.author.avatar} alt="" />
            ) : null}
            <AvatarFallback className="bg-slate-200 text-slate-600">
              {(post.author?.userName || post.author?.displayName || '?').slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {post.author?._id ? (
                <Link
                  to={`/user/${post.author._id}`}
                  className="font-medium text-slate-900 hover:text-indigo-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.author?.displayName || post.author?.userName || '匿名用户'}
                </Link>
              ) : (
                <span className="font-medium text-slate-900">
                  {post.author?.displayName || post.author?.userName || '匿名用户'}
                </span>
              )}
              <span>·</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
            {post.isPinned && (
              <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                <Pin className="w-3 h-3" />
                置顶
              </div>
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
            {highlightKeyword(post.title, keyword)}
          </h3>
          {post.summary && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-3">
              {highlightKeyword(post.summary, keyword)}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.category && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                  {post.category.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1 hover:text-red-500">
                <Heart className="w-4 h-4" />
                <span>{post.likeCount || 0}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-indigo-600">
                <MessageCircle className="w-4 h-4" />
                <span>{post.replyCount || 0}</span>
              </div>
              <button
                className="p-1 hover:text-indigo-600"
                onClick={(e) => e.stopPropagation()}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { categories, selectedCategoryId, fetchCategories, setSelectedCategory } = usePostStore()

  const keyword = searchParams.get('keyword') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState<SearchPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchInput, setSearchInput] = useState(keyword)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (!keyword) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')

    postApi
      .searchPosts(keyword, categoryId || undefined, page, 10)
      .then((res) => {
        setPosts(res.list)
        setPagination(res.pagination)
      })
      .catch((err) => {
        setError(err.message || '搜索失败，请稍后重试')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [keyword, categoryId, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(newPage))
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-indigo-600">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Kooboo Forum</h1>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex relative w-64 lg:w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜索讨论、标签或用户..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </form>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
            </button>

            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            {/* User Menu */}
            <div className="relative flex items-center gap-3 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.displayName || user?.userName || '用户'}</p>
              </div>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1 hover:bg-slate-100 rounded-lg p-1"
              >
                <Avatar className="w-8 h-8">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">
                    {(user?.displayName || user?.userName || '?').slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 py-2 min-w-[160px] z-50">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    个人主页
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    设置
                  </Link>
                  <hr className="my-2 border-slate-100" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      navigate('/login')
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧边栏 */}
          <HomeSidebar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => {
              setSelectedCategory(id)
              if (id) {
                navigate(`/search?keyword=${keyword}&categoryId=${id}`)
              } else {
                navigate(`/search?keyword=${keyword}`)
              }
            }}
          />

          {/* 右侧搜索结果 */}
          <section className="flex-1 space-y-6 my-8">
            {/* 搜索结果标题 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-center gap-2">
                <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <h2 className="text-lg font-semibold">
                  搜索结果: <span className="text-indigo-600">"{keyword}"</span>
                </h2>
                {pagination && (
                  <span className="text-sm text-slate-400 ml-2">
                    找到 {pagination.total} 个结果
                  </span>
                )}
              </div>
            </div>

            {/* 搜索结果列表 */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400">未找到相关帖子</p>
                <p className="text-sm text-slate-400 mt-1">试试其他关键词</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <SearchPostItem
                    key={post._id}
                    post={post}
                    keyword={keyword}
                    onClick={() => navigate(`/post/${post._id}`)}
                  />
                ))}
              </div>
            )}

            {/* 分页 */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-sm text-slate-500">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  下一页
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
