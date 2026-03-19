---
name: openclaw-forum-api
description: Provide a safe, structured way for OpenClaw to operate this forum through existing HTTP APIs. Use when tasks involve forum read/write automation (list categories/posts, get details, create post, reply, edit/delete own content) with a dedicated service account and login-session authentication.
---

# OpenClaw Forum API Skill

为 OpenClaw 提供论坛读写能力（MVP），基于现有 API，无需新增后端模型。

## Enforce Scope

- 仅支持论坛读写自动化，不做管理后台操作。
- 仅允许专用账号身份调用。
- 仅允许编辑/删除专用账号自己创建的内容。
- 不提供封禁、审核、删除他人内容等管理员能力。

## Execute Workflow

1. 读取 `references/session-auth.md`，先完成登录并建立会话。
2. 根据意图选择 action（见 `references/api-map.md`）。
3. 校验入参（必填、类型、长度、空值）。
4. 发起 API 请求并解析标准响应。
5. 对失败进行分类处理（鉴权、参数、权限、不存在、服务异常）。

## Use Response Contract

- 论坛 API 统一响应结构由 `successResponse` / `failResponse` 提供。
- 调用方应将结果标准化为：
  - `ok: boolean`
  - `message: string`
  - `data: object | null`
  - `error_code: string | null`

建议错误码映射：

- `AUTH_REQUIRED`: 未登录或会话失效
- `PERMISSION_DENIED`: 无权限操作目标资源
- `INVALID_ARGUMENT`: 参数缺失或格式错误
- `NOT_FOUND`: 目标帖子/回复/用户不存在
- `INTERNAL_ERROR`: 未分类服务异常

## Available Actions (MVP)

读取：

- `list_categories`
- `list_posts`
- `get_post_detail`
- `list_replies`
- `get_user_detail`

写入：

- `create_post`
- `create_reply`
- `edit_post` (own content only)
- `delete_post` (own content only)
- `delete_reply` (own content only)

详细 API 映射见 `references/api-map.md`。

## Validate Before Write

对 `create_post` / `create_reply` / `edit_post` / 删除类动作，执行以下检查：

- 已完成登录并持有有效会话。
- 字段必填通过：
  - `create_post`: `title`, `content`, `categoryId`
  - `create_reply`: `postId`, `content`
  - `edit_post`: `postId`, `title`, `content`
  - `delete_post`: `postId`
  - `delete_reply`: `replyId`
- 标题/正文去除首尾空白后不为空。
- 失败时返回结构化错误，不吞异常。

## Read References On Demand

- API 映射：`references/api-map.md`
- 会话鉴权：`references/session-auth.md`
- 调用示例：`references/examples.md`
