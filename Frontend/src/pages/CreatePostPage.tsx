import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { postApi } from '@/api/post'
import { usePostStore } from '@/stores/postStore'
import { ArrowLeft, Bold, Italic, List, ListOrdered, Image as ImageIcon } from 'lucide-react'

export default function CreatePostPage() {
  const navigate = useNavigate()
  const { categories, fetchCategories } = usePostStore()
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 初始化编辑器
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: '在这里编写帖子内容...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none',
      },
    },
  })

  // 加载分类列表
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // 处理图片粘贴
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault()
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            await handleImageUpload(file)
          }
          break
        }
      }
    },
    [editor]
  )

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    try {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        setError('请上传图片文件')
        return
      }

      // 验证文件大小（2MB）
      if (file.size > 2 * 1024 * 1024) {
        setError('图片大小不能超过 2MB')
        return
      }

      const url = await postApi.uploadImage(file)
      if (editor && url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片上传失败')
    }
  }

  // 添加图片按钮点击
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
    const content = editor?.getHTML() || ''
    if (!content.trim() || content === '<p></p>') {
      setError('请输入帖子内容')
      return
    }

    setIsSubmitting(true)
    try {
      const post = await postApi.createPost({
        title: title.trim(),
        content,
        categoryId,
      })
      navigate(`/post/${post._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发帖失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 添加图片按钮点击
  const addImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleImageUpload(file)
      }
    }
    input.click()
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

          {/* 富文本编辑器 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              内容
            </label>
            <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
              {/* 工具栏 */}
              <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={editor?.isActive('bold') ? 'bg-slate-200' : ''}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={editor?.isActive('italic') ? 'bg-slate-200' : ''}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-slate-300 mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={editor?.isActive('bulletList') ? 'bg-slate-200' : ''}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={editor?.isActive('orderedList') ? 'bg-slate-200' : ''}
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-slate-300 mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addImage}
                  className={editor?.isActive('image') ? 'bg-slate-200' : ''}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <span className="text-xs text-slate-400 ml-2">
                  支持粘贴图片
                </span>
              </div>

              {/* 编辑器内容区域 */}
              <div
                className="p-4 min-h-[300px]"
                onPaste={handlePaste}
              >
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
