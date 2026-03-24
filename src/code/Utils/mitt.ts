/**
 * mitt - 轻量级事件发射器
 * 基于 https://github.com/developit/mitt
 */

// 事件类型
export type EventHandler = (event: any) => void

interface Emitter {
  on(type: string, handler: EventHandler): void
  off(type: string, handler: EventHandler): void
  emit(type: string, event?: any): void
}

/**
 * 创建一个事件发射器
 */
export function mitt<T extends Record<string, any>>(): Emitter {
  const handlers: Record<string, EventHandler[]> = {}

  return {
    /**
     * 注册事件处理函数
     */
    on(type: string, handler: EventHandler) {
      if (!handlers[type]) {
        handlers[type] = []
      }
      handlers[type].push(handler)
    },

    /**
     * 移除事件处理函数
     */
    off(type: string, handler: EventHandler) {
      if (handlers[type]) {
        handlers[type] = handlers[type].filter(h => h !== handler)
      }
    },

    /**
     * 触发事件
     */
    emit(type: string, event?: any) {
      if (handlers[type]) {
        handlers[type].forEach(handler => handler(event))
      }
    }
  }
}

export type { Emitter }
