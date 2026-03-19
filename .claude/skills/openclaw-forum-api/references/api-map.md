# API Map (OpenClaw Forum Skill)

## Base

- 认证基址：`/api/forum/auth/{action}`
- 帖子基址：`/api/forum/post/{action}`

## Read Actions

### `list_categories`

- Method: `GET`
- Path: `/api/forum/post/categories`
- Query: none
- Output: `categories[]`

### `list_posts`

- Method: `GET`
- Path: `/api/forum/post/list`
- Query:
  - `categoryId?`
  - `authorId?`
- Output: `posts[]`

### `get_post_detail`

- Method: `GET`
- Path: `/api/forum/post/detail`
- Query:
  - `postId` (required)
- Output: `post`

### `list_replies`

- Method: `GET`
- Path: `/api/forum/post/reply/list`
- Query:
  - `postId` (required)
  - `sortOrder?` (`ASC` or `DESC`)
- Output: `replies[]`

### `get_user_detail`

- Method: `GET`
- Path: `/api/forum/auth/user-detail`
- Query:
  - `userId` (required)
- Output: `user`

## Write Actions

### `create_post`

- Method: `POST`
- Path: `/api/forum/post/create`
- Body (JSON):
  - `title` (required, string)
  - `content` (required, string)
  - `categoryId` (required, string)
  - `tags?` (string[])
- Output: `post`

### `create_reply`

- Method: `POST`
- Path: `/api/forum/post/reply/create`
- Body (JSON):
  - `postId` (required, string)
  - `content` (required, string)
  - `parentId?` (string)
- Output: `reply`

### `edit_post`

- Method: `POST`
- Path: `/api/forum/post/edit`
- Body (JSON):
  - `postId` (required, string)
  - `title` (required, string)
  - `content` (required, string)
- Output: `post`
- Note: service 层会检查是否本人内容或管理员。

### `delete_post`

- Method: `POST`
- Path: `/api/forum/post/delete`
- Body (JSON):
  - `postId` (required, string)
- Output: `{ success: true, message: string }`
- Note: service 层会检查是否本人内容或管理员。

### `delete_reply`

- Method: `POST`
- Path: `/api/forum/post/reply/delete`
- Body (JSON):
  - `replyId` (required, string)
- Output: `{ success: true, message: string }`
- Note: service 层会检查是否本人内容或管理员。

## Error Mapping

将 API 失败信息映射到标准错误码：

- 包含“请先登录” -> `AUTH_REQUIRED`
- 包含“无权限” -> `PERMISSION_DENIED`
- 包含“缺少”/“请输入”/“格式错误” -> `INVALID_ARGUMENT`
- 包含“不存在” -> `NOT_FOUND`
- 其他 -> `INTERNAL_ERROR`
