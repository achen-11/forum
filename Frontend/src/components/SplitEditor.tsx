import { useState, useRef, useCallback, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { GripVertical } from 'lucide-react'
import { postApi } from '@/api/post'
import 'highlight.js/styles/github.css'

interface SplitEditorProps {
  value: string
  onChange: (value: string) => void
}

export function SplitEditor({ value, onChange }: SplitEditorProps) {
  const [splitRatio, setSplitRatio] = useState(50) // percentage for left side
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle drag to resize
  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100
      setSplitRatio(Math.min(Math.max(newRatio, 20), 80)) // Limit between 20-80%
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Handle paste - detect markdown and image
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items
      if (!items) return

      // Check for image first
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            try {
              const url = await postApi.uploadImage(file)
              const imageMarkdown = `![image](${url})`
              const textarea = e.target as HTMLTextAreaElement
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              const newValue =
                value.substring(0, start) + imageMarkdown + value.substring(end)
              onChange(newValue)
              // Set cursor position after image
              setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length
              }, 0)
            } catch (err) {
              console.error('Image upload failed:', err)
            }
          }
          return
        }
      }

      // Check for plain text - detect markdown
      const text = e.clipboardData?.getData('text/plain')
      if (text) {
        // Simple markdown detection - check for common patterns
        const markdownPatterns = [
          /^#{1,6}\s/m, // Headers
          /^\*{1,2}.+\*{1,2}/m, // Bold/Italic
          /^\[.+\]\(.+\)$/m, // Links
          /^```[\s\S]*```$/m, // Code blocks
          /^[-*]\s/m, // Bullet lists
          /^\d+\.\s/m, // Numbered lists
          /^>\s/m, // Blockquotes
        ]

        const isMarkdown = markdownPatterns.some((pattern) => pattern.test(text))

        if (isMarkdown) {
          // Insert as-is, let the preview show rendered version
          // User can convert to HTML using toolbar if needed
        }
      }
    },
    [value, onChange]
  )

  return (
    <div className="border border-slate-300 border-t-[0] bg-white overflow-hidden h-full">
      {/* Editor Content */}
      <div
        ref={containerRef}
        className="relative flex min-h-0 h-full"
      >
        {/* Source Editor */}
        <div
          className="border-r border-slate-200"
          style={{ width: `${splitRatio}%`, minWidth: '20%', maxWidth: '80%' }}
        >
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
            placeholder="在这里编写 Markdown 内容...

支持语法：
# 标题
**粗体** *斜体*
- 列表项
1. 有序列表
[链接](url)
![图片](url)
`代码`"
            spellCheck={false}
          />
        </div>

        {/* Draggable Divider */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-slate-200 cursor-col-resize hover:bg-slate-400 transition-colors flex items-center justify-center z-10"
          style={{ left: `${splitRatio}%`, transform: 'translateX(-50%)' }}
          onMouseDown={handleMouseDown}
        >
          <div className="h-8 w-1 bg-slate-300 rounded-full">
            <GripVertical className="w-3 h-3 text-slate-400 -ml-0.5 mt-2" />
          </div>
        </div>

        {/* Preview */}
        <div
          className="prose prose-sm sm:prose-base lg:prose-lg max-w-none p-4 overflow-auto flex-1"
          style={{ width: `${100 - splitRatio}%` }}
        >
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // Custom image rendering to handle base64
                  img: ({ ...props }) => (
                    <img
                      {...props}
                      className="max-w-full h-auto rounded-lg"
                      loading="lazy"
                    />
                  ),
                  // Code block styling
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match
                    return isInline ? (
                      <code
                        className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-slate-400 italic">预览区域</p>
            )}
          </div>
      </div>
    </div>
  )
}
