import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { postApi } from '@/api/post'
import { usePostStore } from '@/stores/postStore'
import { toast } from '@/lib/toast'
import type { Post, Tag } from '@/types/post'
import { X, Bold, Italic, Heading2, Link, Quote, Code, Image as ImageIcon, List, ListOrdered } from 'lucide-react'
import { SplitEditor } from '@/components/SplitEditor'

interface PostFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialData?: Post  // For edit mode
  onSuccess?: (post: Post) => void  // For edit mode success callback
}

export function PostFormDrawer({ open, onOpenChange, mode, initialData, onSuccess }: PostFormDrawerProps) {
  const navigate = useNavigate()
  const { categories, tags, fetchCategories, fetchTags } = usePostStore()
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [content, setContent] = useState('')

  const isEditMode = mode === 'edit'

  // Load categories and tags when drawer opens
  useEffect(() => {
    if (open) {
      fetchCategories()
      fetchTags()
    }
  }, [open, fetchCategories, fetchTags])

  // Reset form when drawer closes / Initialize form when opening in edit mode
  useEffect(() => {
    if (!open) {
      setTitle('')
      setCategoryId('')
      setSelectedTags([])
      setNewTagName('')
      setContent('')
    } else if (isEditMode && initialData) {
      // Pre-fill data for edit mode - use markdownContent directly
      setTitle(initialData.title || '')
      setCategoryId(initialData.categoryId || '')
      setContent(initialData.markdownContent || initialData.content?.replace(/<[^>]*>/g, '') || '')
      // Note: Tags would need to be loaded and matched by name
    }
  }, [open, isEditMode, initialData])

  // Insert markdown syntax at cursor position
  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

    setContent(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + before.length
      textarea.selectionEnd = start + before.length + selectedText.length
    }, 0)
  }, [content])

  // Toolbar actions
  const toolbarActions = [
    { icon: Bold, title: '粗体', action: () => insertMarkdown('**', '**') },
    { icon: Italic, title: '斜体', action: () => insertMarkdown('*', '*') },
    { icon: Heading2, title: '标题', action: () => insertMarkdown('## ', '') },
    { icon: Link, title: '链接', action: () => insertMarkdown('[', '](url)') },
    { icon: Quote, title: '引用', action: () => insertMarkdown('> ', '') },
    { icon: Code, title: '代码', action: () => insertMarkdown('`', '`') },
    { icon: List, title: '无序列表', action: () => insertMarkdown('- ', '') },
    { icon: ListOrdered, title: '有序列表', action: () => insertMarkdown('1. ', '') },
  ]

  // Handle image upload from toolbar
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          // Validate file size (2MB)
          if (file.size > 2 * 1024 * 1024) {
            toast.error('图片大小不能超过 2MB')
            return
          }

          const url = await postApi.uploadImage(file)
          const imageMarkdown = `\n![image](${url})\n`
          setContent(prev => prev + imageMarkdown)
        } catch (err) {
          toast.error(err instanceof Error ? err.message : '图片上传失败')
        }
      }
    }
    input.click()
  }, [])

  // Handle add tag
  const handleAddTag = (tag: Tag) => {
    if (!selectedTags.find(t => t._id === tag._id)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Handle remove tag
  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(t => t._id !== tagId))
  }

  // Handle create new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const tag = await postApi.createTag(newTagName.trim())
      if (!selectedTags.find(t => t._id === tag._id)) {
        setSelectedTags([...selectedTags, tag])
      }
      setNewTagName('')
      fetchTags()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建标签失败')
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('请输入帖子标题')
      return
    }

    if (!categoryId) {
      toast.error('请选择分类')
      return
    }

    if (!content.trim()) {
      toast.error('请输入帖子内容')
      return
    }

    // Convert markdown to HTML
    const htmlContent = marked(content, { async: false }) as string

    setIsSubmitting(true)
    try {
      if (isEditMode && initialData) {
        // Edit mode
        const post = await postApi.editPost({
          postId: initialData._id,
          title: title.trim(),
          content: htmlContent,
          markdownContent: content,
        })
        onOpenChange(false)
        onSuccess?.(post)
      } else {
        // Create mode
        const post = await postApi.createPost({
          title: title.trim(),
          content: htmlContent,
          markdownContent: content,
          categoryId,
          tags: selectedTags.map(t => t.name),
        })
        onOpenChange(false)
        navigate(`/post/${post._id}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isEditMode ? '编辑失败，请重试' : '发帖失败，请重试'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle discard
  const handleDiscard = () => {
    if (title || content) {
      if (window.confirm('确定要取消当前内容吗？')) {
        onOpenChange(false)
      }
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent title={isEditMode ? '编辑话题' : '创建新话题'}>
        <DrawerHeader className="sr-only">
          <DrawerTitle>{isEditMode ? '编辑话题' : '创建新话题'}</DrawerTitle>
        </DrawerHeader>

        {/* Guideline warning - only show in create mode */}
        {!isEditMode && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2">
            <p className="text-sm text-amber-800">
              请在发帖前仔细阅读
              <button className="underline hover:text-amber-900">《社区准则》</button>
            </p>
          </div>
        )}

        <div className={`flex flex-col ${isEditMode ? 'h-[calc(70vh-92px)]' : 'h-[calc(70vh-112px)]'} overflow-hidden`}>
          {/* Title, Category, Tags row */}
          <div className="py-4 px-1 space-y-3 border-b">
            {/* Title input */}
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isEditMode ? '输入标题' : '输入标题，或在此处粘贴链接'}
              className="h-10 text-base"
            />

            {/* Category and Tags row */}
            <div className="flex gap-3">
              {/* Category select */}
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tags */}
              <div className="flex-1 flex flex-wrap items-center gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag._id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
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

                {/* Tag dropdown */}
                <div className="relative group">
                  <button
                    type="button"
                    className="px-2 py-0.5 text-xs border border-dashed border-slate-300 rounded-full text-slate-500 hover:border-slate-400"
                  >
                    + 标签
                  </button>
                  {/* Tag dropdown menu */}
                  <div className="hidden group-hover:block absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                    <div className="max-h-32 overflow-y-auto">
                      {tags.filter(t => !selectedTags.find(st => st._id === t._id)).map((tag) => (
                        <button
                          key={tag._id}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          className="block w-full text-left px-2 py-1 text-xs hover:bg-slate-100 rounded"
                        >
                          #{tag.name}
                        </button>
                      ))}
                    </div>
                    <div className="border-t mt-2 pt-2">
                      <Input
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="新建标签..."
                        className="h-7 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleCreateTag()
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1 px-6 py-2 border bg-slate-50">
            {toolbarActions.map((item, index) => (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={item.action}
                title={item.title}
              >
                <item.icon className="w-4 h-4" />
              </Button>
            ))}
            <div className="w-px h-5 bg-slate-300 mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleImageUpload}
              title="上传图片"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <span className="text-xs text-slate-400 ml-2">支持粘贴图片</span>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <SplitEditor value={content} onChange={setContent} />
          </div>

          {/* Footer actions */}
          <DrawerFooter className="border-t mt-4 px-0 py-3 flex-row justify-between shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleDiscard}
            >
            取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? (isEditMode ? '保存中...' : '发布中...') : (isEditMode ? '保存' : '+ 创建话题')}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

// Backward compatibility alias
export { PostFormDrawer as CreatePostDrawer }
