import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminTable } from '@/components/AdminTable'
import { adminCategoryApi } from '@/api/admin_category'
import { useAuthStore } from '@/stores/authStore'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Home,
} from 'lucide-react'

interface Category {
  _id: string
  name: string
  description: string
  parentId: string
  sortOrder: number
  showOnHome: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminCategoryPage() {
  const { user } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)

  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sortOrder: 0,
    showOnHome: true,
  })

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await adminCategoryApi.getCategoryList()
      setCategories(res.list.filter(c => !c.isDeleted))
    } catch (err: any) {
      toast.error(err.message || '获取分类列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    fetchCategories()
  }, [isAdmin])

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return
    try {
      await adminCategoryApi.deleteCategory(deleteCategoryId)
      toast.success('删除成功')
      setDeleteCategoryId(null)
      fetchCategories()
    } catch (err: any) {
      toast.error(err.message || '删除失败')
    }
  }

  const handleCreateOrUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入分类名称')
      return
    }

    try {
      if (editCategory) {
        await adminCategoryApi.updateCategory({
          categoryId: editCategory._id,
          ...formData,
        })
        toast.success('更新成功')
      } else {
        await adminCategoryApi.createCategory(formData)
        toast.success('创建成功')
      }
      setIsCreateOpen(false)
      setEditCategory(null)
      setFormData({ name: '', description: '', sortOrder: 0, showOnHome: true })
      fetchCategories()
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  const openEditDialog = (category: Category) => {
    setEditCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      sortOrder: category.sortOrder,
      showOnHome: category.showOnHome,
    })
    setIsCreateOpen(true)
  }

  const openCreateDialog = () => {
    setEditCategory(null)
    setFormData({ name: '', description: '', sortOrder: 0, showOnHome: true })
    setIsCreateOpen(true)
  }

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: '名称',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.showOnHome && (
            <Badge variant="outline" className="text-xs gap-1">
              <Home className="w-3 h-3" /> 首页展示
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: '描述',
      cell: ({ row }) => row.original.description || '-',
    },
    {
      accessorKey: 'sortOrder',
      header: '排序',
      cell: ({ row }) => row.original.sortOrder,
      sortingFn: 'basic',
    },
    {
      accessorKey: 'createdAt',
      header: '创建时间',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      sortingFn: 'datetime',
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => openEditDialog(row.original)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setDeleteCategoryId(row.original._id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h2 className="text-lg font-semibold mb-2">无权限访问</h2>
            <p className="text-slate-500 text-sm">您没有管理员权限，无法访问此页面。</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>分类列表</CardTitle>
            <Button className="gap-1" onClick={openCreateDialog}>
              <Plus className="w-4 h-4" />
              新建分类
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AdminTable
            columns={columns}
            data={categories}
            loading={loading}
            globalFilterPlaceholder="搜索分类名称..."
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCategory ? '编辑分类' : '新建分类'}</DialogTitle>
            <DialogDescription>
              {editCategory ? '修改分类信息' : '创建一个新的分类'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">分类名称</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入分类名称"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">分类描述</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入分类描述（可选）"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">排序</label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                placeholder="数值越小越靠前"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showOnHome"
                checked={formData.showOnHome}
                onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <label htmlFor="showOnHome" className="text-sm font-medium">在首页展示</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {editCategory ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteCategoryId}
        onOpenChange={() => setDeleteCategoryId(null)}
        title="删除分类"
        description="确定要删除这个分类吗？此操作不可恢复。"
        confirmText="删除"
        variant="destructive"
        onConfirm={handleDeleteCategory}
      />
    </div>
  )
}
