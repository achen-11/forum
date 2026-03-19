# Session Auth Strategy

## Goal

使用专用账号通过登录接口换取会话，再复用会话执行后续论坛读写请求。

## Login Flow

1. 调用 `POST /api/forum/auth/login`
2. Body 示例：

```json
{
  "account": "${FORUM_BOT_ACCOUNT}",
  "password": "${FORUM_BOT_PASSWORD}",
  "loginMode": "password",
  "isRemember": true
}
```

3. 保存响应中的会话信息（通常是 cookie）。
4. 后续请求统一携带该会话信息。

## Re-Login Policy

- 若接口返回“请先登录”或 401/403（取决于网关配置），判定会话失效。
- 自动执行一次重登录并重放原请求。
- 若重登录后仍失败，返回 `AUTH_REQUIRED`。

## Logout

- 可选调用 `POST /api/forum/auth/logout` 主动清理会话。
- 长运行代理建议保留会话并在失效时重登，避免频繁登录。

## Config

建议使用环境变量，不要硬编码凭据：

- `FORUM_API_BASE_URL`
- `FORUM_BOT_ACCOUNT`
- `FORUM_BOT_PASSWORD`

## Security Notes

- 专用账号权限保持最小化，避免管理员角色。
- 禁止在日志输出明文密码或完整 cookie。
- 写操作日志记录 action 与资源 ID，便于审计。
