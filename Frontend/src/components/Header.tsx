import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/authStore'
import { Bell, ChevronDown, Search } from 'lucide-react'

export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  const handleLogout = async () => {
    setShowUserMenu(false)
    await logout()
    navigate('/login')
  }

  return (
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
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (searchInput.trim()) {
              navigate(`/search?keyword=${encodeURIComponent(searchInput.trim())}`)
            }
          }}
          className="hidden md:flex relative w-64 lg:w-96"
        >
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
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <>
                    <hr className="my-2 border-slate-100" />
                    <Link
                      to="/admin/content"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      管理后台
                    </Link>
                  </>
                )}
                <hr className="my-2 border-slate-100" />
                <button
                  onClick={handleLogout}
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
  )
}
