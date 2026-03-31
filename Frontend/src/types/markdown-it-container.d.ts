declare module 'markdown-it-container' {
  import type MarkdownIt from 'markdown-it'
  function container(
    md: MarkdownIt,
    name: string,
    options: {
      render: (tokens: { nesting: number; content: string; type: string }[], idx: number) => string
    }
  ): void
  export default container
  export = container
}
