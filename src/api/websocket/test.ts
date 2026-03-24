// @k-url /api/websocket/test

/**
 * WebSocket 连接测试端点
 * 访问 /api/websocket/test 检查当前 WebSocket 连接状态
 */

if (!k.account.isLogin) {
  k.api.httpCode(401)
}

const connections = k.net.webSocket.list()
const result: any = {
  totalConnections: connections.length,
  connections: [],
  timestamp: Date.now()
}

// 获取每个连接的详细信息
for (const connId of connections) {
  const conn = k.net.webSocket.get(connId)
  if (conn) {
    result.connections.push({
      id: connId,
      // 注意：conn 可能没有其他可读属性
    })
  }
}

k.logger.information('WebSocket Test', `Current connections: ${connections.length}`)
k.logger.information('WebSocket Test', `Connection IDs: ${connections.join(', ')}`)

return result
