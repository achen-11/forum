import { useState, useCallback } from 'react'
import { marked } from 'marked'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { postApi } from '@/api/post'
import type { Reply } from '@/types/post'
import { toast } from '@/lib/toast'
import { Bold, Italic, Heading2, Link, Quote, Code, Image as ImageIcon, List, ListOrdered } from 'lucide-react'
import { SplitEditor } from '@/components/SplitEditor'

interface ReplyDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
  onReplySuccess: (reply: Reply) => void
}

export function ReplyDrawer({ open, onOpenChange, postId, onReplySuccess }: ReplyDrawerProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when drawer closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setContent('')
    }
    onOpenChange(isOpen)
  }

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

  // Handle submit
  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('请输入回复内容')
      return
    }

    // Convert markdown to HTML
    const htmlContent = marked(content, { async: false }) as string

    setIsSubmitting(true)
    try {
      const newReply = await postApi.createReply({
        postId,
        content: htmlContent,
      })
      onReplySuccess(newReply)
      handleOpenChange(false)
      toast.success('回复成功')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '回复失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle discard
  const handleDiscard = () => {
    if (content) {
      if (window.confirm('确定要取消当前内容吗？')) {
        handleOpenChange(false)
      }
    } else {
      handleOpenChange(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent title="回复">
        <div className="flex flex-col h-[calc(70vh-92px)] overflow-hidden px-4">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-2 py-2 border-b bg-slate-50">
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
          <div className="flex items-center justify-between pt-4 shrink-0">
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
              {isSubmitting ? '发布中...' : '发布回复'}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
