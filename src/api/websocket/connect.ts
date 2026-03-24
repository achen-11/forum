// @k-url /api/websocket/connect

import { useSocket } from 'code/Utils/useSocket'
import { SocketParser } from 'code/Utils/useSocket'
import { getCurrentUser } from 'code/Services/auth'

// 1. 鉴权检查
if (!k.account.isLogin) {
  k.api.httpCode(401)
}

// 2. 获取当前用户
const currentUser = getCurrentUser()
if (!currentUser || !currentUser._id) {
  k.api.httpCode(401)
}

const sid = currentUser._id

// 3. 处理已存在的连接（可选）
if (k.net.webSocket.list().find(id => id === sid)) {
  const oldConnection = k.net.webSocket.get(sid)
  if (oldConnection) {
    oldConnection.close()
  }
}

// 4. 创建 socket 实例
const socket = useSocket(sid)

// 5. 监听事件
socket.on('enter', () => {
  k.logger.information('WebSocket', `User ${sid} connected`)
  socket.send({
    to: sid,
    event: 'enter',
    data: { sid }
  })
})

socket.on('heartbeat', () => {
  socket.send({
    to: sid,
    event: 'heartbeat'
  })
})

// 6. 启动连接（阻塞）
socket.accept()
