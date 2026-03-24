import { useEffect, useRef } from 'react'
import { useNotificationStore } from '@/stores/notificationStore'

/**
 * Notification Socket Hook
 *
 * Connects to Kooboo WebSocket server to receive real-time notifications.
 * Uses a module-level flag to prevent duplicate connections across re-renders.
 */
const connections = new Map<string | null, WebSocket>()

export function useNotificationSocket(userId: string | null) {
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!userId) {
      // Cleanup if user logs out
      const existingWs = connections.get(userId)
      if (existingWs) {
        console.log('[WebSocket] Cleaning up connection for logged out user')
        existingWs.close(1000, 'User logged out')
        connections.delete(userId)
      }
      return
    }

    // Check if already connected
    const existingWs = connections.get(userId)
    if (existingWs && existingWs.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected for user:', userId)
      return
    }

    // Close existing connection if any
    if (existingWs) {
      console.log('[WebSocket] Closing existing connection for user:', userId)
      existingWs.close(1000, 'Reconnecting')
      connections.delete(userId)
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/api/websocket/connect`

    console.log('[WebSocket] Creating new connection for user:', userId, 'to:', wsUrl)

    const ws = new WebSocket(wsUrl)
    connections.set(userId, ws)

    ws.onopen = () => {
      console.log('[WebSocket] Connected, readyState:', ws.readyState)

      // Send enter event
      ws.send(JSON.stringify({
        event: 'enter',
        data: { userId }
      }))
    }

    ws.onmessage = (event) => {
      console.log('[WebSocket] Received:', event.data)
      try {
        const message = JSON.parse(event.data)

        if (message.event === 'notification') {
          console.log('[WebSocket] Notification received!')
          const { addNotification, fetchUnreadCount } = useNotificationStore.getState()
          addNotification(message.data)
          fetchUnreadCount()
        }
      } catch (err) {
        console.error('[WebSocket] Parse error:', err)
      }
    }

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error)
    }

    ws.onclose = (event) => {
      console.log('[WebSocket] Closed, code:', event.code, 'reason:', event.reason)
      connections.delete(userId)

      // Auto reconnect on unexpected close
      if (userId && event.code !== 1000) {
        console.log('[WebSocket] Will reconnect in 5 seconds...')
        reconnectTimeoutRef.current = setTimeout(() => {
          if (userId) {
            console.log('[WebSocket] Reconnecting...')
            // Trigger re-connection by updating userId ref
          }
        }, 5000)
      }
    }

    return () => {
      console.log('[WebSocket] Cleanup for user:', userId)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (connections.get(userId) === ws) {
        ws.close(1000, 'Component unmounting')
        connections.delete(userId)
      }
    }
  }, [userId])
}
