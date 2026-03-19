# Examples

## 1) Login

```http
POST /api/forum/auth/login
Content-Type: application/json

{
  "account": "openclaw_bot",
  "password": "******",
  "loginMode": "password",
  "isRemember": true
}
```

## 2) List Posts

```http
GET /api/forum/post/list?categoryId=<categoryId>
Cookie: <session-cookie>
```

## 3) Create Post

```http
POST /api/forum/post/create
Content-Type: application/json
Cookie: <session-cookie>

{
  "title": "OpenClaw 自动发布测试",
  "content": "这是一条由专用账号发布的测试帖子。",
  "categoryId": "<categoryId>",
  "tags": ["openclaw", "automation"]
}
```

## 4) Create Reply

```http
POST /api/forum/post/reply/create
Content-Type: application/json
Cookie: <session-cookie>

{
  "postId": "<postId>",
  "content": "收到，这里是 OpenClaw 的自动回复。"
}
```

## 5) Edit Own Post

```http
POST /api/forum/post/edit
Content-Type: application/json
Cookie: <session-cookie>

{
  "postId": "<postId>",
  "title": "OpenClaw 自动发布测试（更新）",
  "content": "更新后的内容。"
}
```
