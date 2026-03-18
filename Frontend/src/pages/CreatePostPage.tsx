import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import { SplitEditor } from '@/components/SplitEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { postApi } from '@/api/post'
import { usePostStore } from '@/stores/postStore'
import type { Tag } from '@/types/post'
import { ArrowLeft, Plus, X } from 'lucide-react'

export default function CreatePostPage() {
  const navigate = useNavigate()
  const { categories, tags, fetchCategories, fetchTags } = usePostStore()
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')

  // 加载分类和标签列表
  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [fetchCategories, fetchTags])

  // 处理添加标签
  const handleAddTag = (tag: Tag) => {
    if (!selectedTags.find(t => t._id === tag._id)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // 处理移除标签
  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(t => t._id !== tagId))
  }

  // 处理创建新标签
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const tag = await postApi.createTag(newTagName.trim())
      if (!selectedTags.find(t => t._id === tag._id)) {
        setSelectedTags([...selectedTags, tag])
      }
      setNewTagName('')
      fetchTags() // 刷新标签列表
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建标签失败')
    }
  }

  // 提交帖子
  const handleSubmit = async () => {
    setError('')

    // 验证标题
    if (!title.trim()) {
      setError('请输入帖子标题')
      return
    }

    // 验证分类
    if (!categoryId) {
      setError('请选择分类')
      return
    }

    // 验证内容
    if (!content.trim()) {
      setError('请输入帖子内容')
      return
    }

    // 将 Markdown 转换为 HTML
    const htmlContent = marked(content, { async: false }) as string

    setIsSubmitting(true)
    try {
      const post = await postApi.createPost({
        title: title.trim(),
        content: htmlContent,
        categoryId,
        tags: selectedTags.map(t => t.name),
      })
      navigate(`/post/${post._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发帖失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
              <h1 className="text-lg font-semibold text-slate-900">发布帖子</h1>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {isSubmitting ? '发布中...' : '发布'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* 标题输入 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              标题
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入帖子标题"
              className="h-11"
              maxLength={100}
            />
          </div>

          {/* 分类选择 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              分类
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-11 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">请选择分类</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 标签选择 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              标签
            </label>
            {/* 已选标签 */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag._id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                    style={{ backgroundColor: tag.color || '#6366f1', color: '#fff' }}
                  >
                    #{tag.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag._id)}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* 标签选择器 */}
            <div className="border border-slate-300 rounded-lg bg-white p-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.filter(t => !selectedTags.find(st => st._id === t._id)).map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-2 py-1 text-xs rounded-full hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: tag.color || '#6366f1', color: '#fff' }}
                  >
                    + #{tag.name}
                  </button>
                ))}
              </div>
              {/* 创建新标签 */}
              <div className="flex gap-2">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="创建新标签..."
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateTag()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Markdown 编辑器 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              内容
            </label>
            <SplitEditor value={content} onChange={setContent} />
          </div>
        </div>
      </main>
    </div>
  )
}
