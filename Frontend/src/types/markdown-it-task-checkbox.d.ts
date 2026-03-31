declare module 'markdown-it-task-checkbox' {
  import type { PluginWithOptions } from 'markdown-it'
  const taskCheckbox: PluginWithOptions<{ disabled?: boolean }>
  export default taskCheckbox
}
