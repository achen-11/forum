import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminTagApi } from '@/api/admin_tag'
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
  Loader2,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'

interface Tag {
  _id: string
  name: string
  color: string
  usageCount: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

// 预设颜色选项
const COLOR_OPTIONS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
]

export default function AdminTagPage() {
  const { user } = useAuthStore()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  const [deleteTagId, setDeleteTagId] = useState<string | null>(null)

  const [editTag, setEditTag] = useState<Tag | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
  })

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const fetchTags = async () => {
    setLoading(true)
    try {
      const res = await adminTagApi.getTagList()
      setTags(res.list.filter(t => !t.isDeleted))
    } catch (err: any) {
      toast.error(err.message || '获取标签列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    fetchTags()
  }, [isAdmin])

  const handleDeleteTag = async () => {
    if (!deleteTagId) return
    try {
      await adminTagApi.deleteTag(deleteTagId)
      toast.success('删除成功')
      setDeleteTagId(null)
      fetchTags()
    } catch (err: any) {
      toast.error(err.message || '删除失败')
    }
  }

  const handleCreateOrUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入标签名称')
      return
    }

    try {
      if (editTag) {
        await adminTagApi.updateTag({
          tagId: editTag._id,
          ...formData,
        })
        toast.success('更新成功')
      } else {
        await adminTagApi.createTag(formData)
        toast.success('创建成功')
      }
      setIsCreateOpen(false)
      setEditTag(null)
      setFormData({ name: '', color: '#6366f1' })
      fetchTags()
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  const openEditDialog = (tag: Tag) => {
    setEditTag(tag)
    setFormData({
      name: tag.name,
      color: tag.color,
    })
    setIsCreateOpen(true)
  }

  const openCreateDialog = () => {
    setEditTag(null)
    setFormData({ name: '', color: '#6366f1' })
    setIsCreateOpen(true)
  }

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
              <CardTitle>标签列表</CardTitle>
              <Button className="gap-1" onClick={openCreateDialog}>
                <Plus className="w-4 h-4" />
                新建标签
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                暂无标签数据
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tags.map((tag) => (
                  <div
                    key={tag._id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{tag.name}</p>
                        <p className="text-xs text-slate-400">{tag.usageCount} 篇帖子</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEditDialog(tag)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteTagId(tag._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTag ? '编辑标签' : '新建标签'}</DialogTitle>
            <DialogDescription>
              {editTag ? '修改标签信息' : '创建一个新的标签'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">标签名称</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入标签名称"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">标签颜色</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color
                        ? 'border-slate-800 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#6366f1"
                  className="w-32"
                />
                <div
                  className="w-8 h-8 rounded border border-slate-200"
                  style={{ backgroundColor: formData.color }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {editTag ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTagId}
        onOpenChange={() => setDeleteTagId(null)}
        title="删除标签"
        description="确定要删除这个标签吗？此操作不可恢复。"
        confirmText="删除"
        variant="destructive"
        onConfirm={handleDeleteTag}
      />
    </div>
  )
}
