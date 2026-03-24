import { Link } from 'react-router-dom'
import { Home, MessageCircle, FileText, ChevronRight } from 'lucide-react'
import type { Category, Tag } from '@/types/post'

interface HomeSidebarProps {
  categories: Category[]
  tags: Tag[]
  selectedCategoryId: string | null
  currentView?: 'posts' | 'notifications'
  onViewChange?: (view: 'posts' | 'notifications') => void
  onSelectCategory: (categoryId: string | null) => void
}

export function HomeSidebar({ categories, tags, selectedCategoryId, currentView, onViewChange, onSelectCategory }: HomeSidebarProps) {
  return (
    <aside className="w-60 flex-shrink-0 space-y-4 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto">
      {/* Navigation */}
      <nav className="bg-white rounded-xl border border-slate-200 p-2">
        <div className="px-3 py-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">导航</span>
        </div>
        <button
          onClick={() => onViewChange?.('posts')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
            currentView === 'posts'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Home className="w-4 h-4" />
          首页
        </button>
        <button
          onClick={() => onViewChange?.('notifications')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
            currentView === 'notifications'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          消息
        </button>
        <Link
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
        >
          <FileText className="w-4 h-4" />
          我的帖子
        </Link>
      </nav>

      {/* 分类列表 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">分类</h2>
        <nav className="space-y-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
              selectedCategoryId === null
                ? 'bg-indigo-50 text-indigo-600 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
            <span className="flex-1 text-left">全部</span>
          </button>

          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => onSelectCategory(category._id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                selectedCategoryId === category._id
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
              <span className="flex-1 text-left truncate">{category.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">标签</h2>
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <span className="text-xs text-slate-400">暂无标签</span>
          ) : (
            tags.map((tag) => (
              <Link
                key={tag._id}
                to={`/search?tag=${encodeURIComponent(tag.name)}`}
                className="px-3 py-1 text-xs rounded-full hover:opacity-80 cursor-pointer transition-opacity"
                style={{ backgroundColor: tag.color || '#6366f1', color: '#fff' }}
              >
                #{tag.name}
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  )
}
