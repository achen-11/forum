import MarkdownIt from 'markdown-it'
import MarkdownItContainer from 'markdown-it-container'
import markdownItTaskCheckbox from 'markdown-it-task-checkbox'
import { createHighlighter, type Highlighter } from 'shiki'

// Language list for on-demand loading
const LANGUAGES = [
  'javascript',
  'typescript',
  'css',
  'html',
  'json',
  'bash',
  'python',
  'go',
  'rust',
  'java',
  'cpp',
  'c',
] as const

// Singleton highlighter instance
let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: [...LANGUAGES],
    })
  }
  return highlighterPromise
}

// Synchronous cache for highlighted code
const highlightedCache = new Map<string, string>()

async function highlightCodeAsync(code: string, lang: string): Promise<string> {
  const cacheKey = `${lang}:${code}`
  if (highlightedCache.has(cacheKey)) {
    return highlightedCache.get(cacheKey)!
  }

  const highlighter = await getHighlighter()
  const supportedLang = LANGUAGES.includes(lang as (typeof LANGUAGES)[number])

  let html: string
  if (supportedLang) {
    html = highlighter.codeToHtml(code, {
      lang,
      theme: 'github-dark',
    })
  } else {
    html = `<pre class="shiki github-dark"><code>${escapeHtml(code)}</code></pre>`
  }

  highlightedCache.set(cacheKey, html)
  return html
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  python: 'Python',
  py: 'Python',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  css: 'CSS',
  html: 'HTML',
  json: 'JSON',
  bash: 'Bash',
  shell: 'Shell',
  text: 'Text',
}

// Copy button SVG
const COPY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`

// Wrap code block with language label and copy button
function wrapCodeBlock(html: string, lang: string): string {
  const displayLang = LANGUAGE_NAMES[lang] || lang.toUpperCase()
  const langLabel = lang && lang !== 'text' ? `<span class="code-lang">${displayLang}</span>` : ''
  const copyBtn = `<button class="code-copy-btn" data-code="" onclick="window.copyCode(this)">${COPY_SVG}</button>`

  return `<div class="code-block-wrapper">${langLabel}${copyBtn}${html}</div>`
}

// Replaces code blocks in HTML with highlighted versions
async function highlightCodeBlocks(html: string): Promise<string> {
  const codeBlockRegex = /<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g

  const matches: { original: string; replacement: string }[] = []
  const highlightPromises: Promise<void>[] = []

  let match: RegExpExecArray | null
  while ((match = codeBlockRegex.exec(html)) !== null) {
    const [, lang, code] = match
    const decodedCode = decodeHtmlEntities(code)
    const actualLang = lang || 'text'
    const originalMatch = match[0]

    matches.push({
      original: originalMatch,
      replacement: '',
    })

    highlightPromises.push(
      highlightCodeAsync(decodedCode, actualLang).then((highlighted) => {
        const m = matches.find((x) => x.original === originalMatch)
        if (m) {
          const wrapped = wrapCodeBlock(highlighted, actualLang)
          const codeForCopy = encodeURIComponent(decodedCode)
          m.replacement = wrapped.replace('data-code=""', `data-code="${codeForCopy}"`)
        }
      })
    )
  }

  if (highlightPromises.length === 0) return html

  await Promise.all(highlightPromises)

  let result = html
  for (const m of matches) {
    result = result.replace(m.original, m.replacement)
  }
  return result
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// VitePress-style container colors
const CONTAINER_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  tip: {
    bg: '#f0fdf4',
    border: '#22c55e',
    text: '#166534',
    label: 'TIP',
  },
  warning: {
    bg: '#fffbeb',
    border: '#f59e0b',
    text: '#92400e',
    label: 'WARNING',
  },
  danger: {
    bg: '#fef2f2',
    border: '#ef4444',
    text: '#991b1b',
    label: 'DANGER',
  },
  info: {
    bg: '#eff6ff',
    border: '#3b82f6',
    text: '#1e40af',
    label: 'INFO',
  },
}

// Create markdown-it renderer with VitePress-style containers
function createMarkdownRenderer(): MarkdownIt {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  })

  // Custom container renderer
  const createContainerRender = (type: string) => {
    const style = CONTAINER_STYLES[type]
    if (!style) return () => ''

    return (_tokens: any[], idx: number): string => {
      if (_tokens[idx].nesting === 1) {
        return `<div class="vitepress-container" style="background:${style.bg};border-radius:8px;padding:16px;margin:16px 0;">`
      }
      return '</div>\n'
    }
  }

  md.use(MarkdownItContainer, 'tip', { render: createContainerRender('tip') })
  md.use(MarkdownItContainer, 'warning', { render: createContainerRender('warning') })
  md.use(MarkdownItContainer, 'danger', { render: createContainerRender('danger') })
  md.use(MarkdownItContainer, 'info', { render: createContainerRender('info') })

  // Task list support (disabled checkboxes)
  md.use(markdownItTaskCheckbox, { disabled: true })

  // Image rendering with click to preview
  md.renderer.rules.image = function (tokens, idx, _options, _env, _self) {
    const token = tokens[idx]
    const src = token.attrGet('src') || ''
    const alt = token.content || ''
    const title = token.attrGet('title') || ''

    return `<img src="${src}" alt="${alt}" title="${title}" class="preview-image" onclick="window.openImagePreview(this.src)" style="cursor:pointer;max-width:100%;border-radius:8px;" />`
  }

  return md
}

// Singleton instance
let markdownRenderer: MarkdownIt | null = null

function getMarkdownRenderer(): MarkdownIt {
  if (!markdownRenderer) {
    markdownRenderer = createMarkdownRenderer()
  }
  return markdownRenderer
}

// Render markdown to HTML string (synchronous)
export function renderMarkdown(content: string): string {
  const renderer = getMarkdownRenderer()
  return renderer.render(content)
}

// Render markdown with async code highlighting
export async function renderMarkdownAsync(content: string): Promise<string> {
  const html = renderMarkdown(content)
  return highlightCodeBlocks(html)
}

// Highlight code with shiki (async, returns Promise)
export async function highlightCode(code: string, lang: string): Promise<string> {
  return highlightCodeAsync(code, lang || 'text')
}

// Preload highlighter for better performance
export function preloadHighlighter(): void {
  getHighlighter()
}

// Export CSS for markdown rendering
export const MARKDOWN_CSS = `
/* Inline code - only style code inside paragraphs or list items (not inside pre/code blocks) */
p code, li code, .vitepress-container code {
  background: #EDEDEB !important;
  color: #DA615C !important;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

/* Code blocks */
.code-block-wrapper {
  position: relative;
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
}

.code-block-wrapper pre.shiki {
  margin: 0;
  padding: 16px;
  border-radius: 0 0 8px 8px;
  overflow-x: auto;
}

.code-block-wrapper .code-lang {
  position: absolute;
  top: 0;
  right: 8px;
  color: #6e7781;
  padding: 6px 8px;
  font-size: 12px;
  font-family: inherit;
  pointer-events: none;
}

.code-copy-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255,255,255);
  border: none;
  color: #888;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0;
}

.code-block-wrapper:hover .code-copy-btn {
  opacity: 1;
}

.code-copy-btn:hover {
  background: rgba(255,255,255,1);
}

.code-copy-btn .copy-icon {
  width: 16px;
  height: 16px;
}

/* VitePress-style containers */
.vitepress-container {
  font-size: 15px;
  line-height: 1.6;
}

.vitepress-container p {
  margin: 0;
}

.vitepress-container p:not(:last-child) {
  margin-bottom: 8px;
}

/* Image preview modal */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}

.image-preview-modal img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

/* Task list */
.task-list-item {
  list-style: none;
  margin-left: -20px;
}

.task-list-item input[type="checkbox"] {
  margin-right: 8px;
  accent-color: #3b82f6;
  cursor: not-allowed;
}
`

// Script to copy code (injected into page)
export const COPY_CODE_SCRIPT = `
<script>
window.copyCode = function(btn) {
  var code = decodeURIComponent(btn.getAttribute('data-code') || '');
  navigator.clipboard.writeText(code).then(function() {
    btn.innerHTML = '<svg t="1774941735823" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2124" width="16" height="16" style="display:block;"><path d="M825.768 376.016 825.768 376.016 475.889 731.658l0 0c-8.265 8.395-19.68 13.595-32.287 13.595-12.607 0-24.022-5.2-32.29-13.595l0 0L213.584 530.629l0 0c-8.26-8.355-13.372-19.96-13.372-32.775 0-25.63 20.442-46.372 45.617-46.372 12.607 0 24.027 5.195 32.292 13.592l0 0 165.48 168.17 317.637-322.864 0 0c8.265-8.355 19.68-13.552 32.285-13.552 25.17 0 45.625 20.78 45.625 46.367C839.148 356.012 834.033 367.619 825.768 376.016L825.768 376.016 825.768 376.016z" fill="#22c55e" p-id="2125"></path></svg>';
    btn.style.color = '#22c55e';
    setTimeout(function() {
      btn.style.color = '#272636';
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    }, 2000);
  });
}

window.openImagePreview = function(src) {
  var modal = document.createElement('div');
  modal.className = 'image-preview-modal';
  modal.onclick = function() { modal.remove(); };
  var img = document.createElement('img');
  img.src = src;
  modal.appendChild(img);
  document.body.appendChild(modal);
}
</script>
`
