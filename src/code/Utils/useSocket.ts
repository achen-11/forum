/**
 * Kooboo WebSocket 工具
 * 用于服务端 WebSocket 连接管理
 */

import { mitt } from './mitt'

/**
 * Socket 消息结构
 */
interface SocketMessage {
  event: string
  data: any
  time?: number
  to?: string
  is_group?: boolean
}

/**
 * Socket 连接接口
 */
interface SocketConnection {
  sendText(message: string, success?: Function): void
  close(): void
}

/**
 * SocketParser 工具
 */
export const SocketParser = {
  /**
   * 解析消息
   */
  parse(data: string): SocketMessage | null {
    try {
      if (!data || data === 'null' || data === 'undefined') {
        return null
      }
      return JSON.parse(data) as SocketMessage
    } catch {
      return null
    }
  },

  /**
   * 序列化消息（移除 null/undefined）
   */
  stringify(message: SocketMessage): string {
    return JSON.stringify(message, (key, value) => {
      if (value === null || value === undefined) {
        return undefined
      }
      return value
    })
  }
}

// 定义事件类型
type Events = 'enter' | 'ping' | 'pong' | 'heartbeat' | 'subscribe' | 'notification'

/**
 * WebSocket 使用钩子
 */
export function useSocket(sid: string) {
  const emitter = mitt<Record<Events, SocketMessage>>()

  function accept() {
    k.net.webSocket.accept(sid, ctx => {
      const parsed = SocketParser.parse(ctx.text)
      if (parsed && parsed.event) {
        emitter.emit(parsed.event, parsed)
      }
    })
  }

  function send(content: {
    to: string
    event: Events
    data?: any
    success?: Function
    failure?: Function
  }) {
    const connection = k.net.webSocket.get(content.to)
    if (!connection) {
      content.failure?.()
      return
    }

    const strData = SocketParser.stringify({
      event: content.event,
      data: content.data,
      time: Date.now()
    })

    connection.sendText(strData, content.success)
  }

  return {
    on: (event: Events, callback: (ctx: SocketMessage) => void) => emitter.on(event, callback),
    off: emitter.off,
    accept,
    send
  }
}

export type { SocketMessage, SocketConnection }
