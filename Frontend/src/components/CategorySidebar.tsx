import { Folder, ChevronRight } from 'lucide-react'
import type { Category } from '@/types/post'

interface CategorySidebarProps {
  categories: Category[]
  selectedCategoryId: string | null
  onSelectCategory: (categoryId: string | null) => void
}

export function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <aside className="w-60 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-3 px-2">分类浏览</h2>
      <nav className="space-y-1">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
            selectedCategoryId === null
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span className="flex-1 text-left">全部</span>
        </button>

        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onSelectCategory(category._id)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
              selectedCategoryId === category._id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
            <span className="flex-1 text-left truncate">{category.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
