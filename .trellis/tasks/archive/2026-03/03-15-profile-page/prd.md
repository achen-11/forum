# brainstorm: 个人中心页

## Goal

为论坛项目增加「个人中心」页面，让用户查看和管理自己的信息，并可选地查看其他用户的主页。

## What I already know

- **路由**：当前有 `/`、`/login`、`/post/new`、`/post/:id`，尚无 `/profile` 或 `/user/:id`。
- **认证与用户**：`useAuthStore` 存有 `user`（UserInfo）；前端已有 `authApi.getCurrentUser()`、`authApi.getUserDetail(userId)`；后端已有 `GET /api/forum/auth/me`、`GET /api/forum/auth/user-detail?userId=xxx`。
- **用户模型**：Forum_User 含 userName, displayName, email, phone, avatar, role, lastLoginAt 等；前端 UserInfo 含 _id, userName, displayName, phone, email, avatar, role, createdAt, lastLoginAt。
- **帖子/评论**：Forum_Post、Forum_Reply 均有 authorId，可做「我的帖子」「我的评论」列表（需确认后端是否已有按用户筛选的接口）。
- **页面风格**：HomePage 等使用 `bg-slate-50`、`slate-900` 等，与 design-guide 的「运动活力」不完全一致；个人中心可延续现有论坛风格。
- **后端**：暂无「更新用户资料」接口（仅重置密码会写库），若要做编辑资料需新增 API。

## Assumptions (temporary)

- 他人主页允许未登录访问（只读公开信息）；若后续需登录再改。
- 编辑资料仅允许改 displayName、avatar（头像 URL）；邮箱/手机涉及验证，本期可不做或仅展示。

## Open Questions

- 无（首期范围已定，可分步实现）。

## Requirements (evolving)

- **双路由**：`/profile`（我的个人中心）、`/user/:id`（他人主页，只读）。
- **我的个人中心**（需登录）：
  - 展示当前用户基本信息（头像、昵称、用户名、邮箱、手机等）。
  - 「我发的帖子」列表：展示当前用户作为作者发布的帖子，可点击进入帖子详情。
  - 编辑资料：可修改 displayName、头像（avatar，存 URL）；提交后调用后端 update-profile，并刷新 authStore 与页面。
  - 入口：Header 点击用户名进入 `/profile`；页面内可有「退出登录」。
- **他人主页**（可未登录访问）：
  - 展示对应用户基本信息（只读），数据来自 `getUserDetail(userId)`；不提供编辑。
  - 帖子/评论列表中作者名可点击，跳转至 `/user/:id`。
- **后端**：
  - 新增「按作者获取帖子列表」：扩展 `GET /api/forum/post/list` 支持 `authorId` 参数，或新增 `list-by-author`；ForumPostService 需支持按 authorId 筛选。
  - 新增「更新当前用户资料」：`PATCH` 或 `PUT /api/forum/auth/update-profile`，body 含 displayName、avatar 等；仅允许改当前登录用户，校验 token。

## Acceptance Criteria (evolving)

- [ ] 路由：`/profile`（我的）、`/user/:id`（他人）；Header 点击用户名进入 `/profile`。
- [ ] 我的个人中心：展示当前用户基本信息；展示「我发的帖子」列表；支持编辑 displayName、头像并保存。
- [ ] 他人主页：展示对应用户基本信息（只读）；帖子详情/评论中作者可点击跳转 `/user/:id`。
- [ ] 未登录访问 `/profile` 重定向到登录；未登录可访问 `/user/:id`（若产品改为需登录再调整）。
- [ ] 后端：帖子列表支持按 authorId 筛选；auth 提供 update-profile 接口。

## Decision (ADR-lite)

**范围**：采用「我的」+「他人主页」。首期包含：展示 + 我的帖子 + 编辑资料；可分步或分子任务实现。

## Definition of Done (team quality bar)

- 符合现有前端规范（路由 Hash、请求用 http、类型用 TypeScript）。
- 若有新 API，需符合后端 api-core 与安全规范。
- Lint / typecheck 通过。
- 文档/注释在行为变更处更新。

## Out of Scope (explicit)

- 「我的评论」列表（本期只做「我的帖子」）。
- 在个人中心内改密码（已有独立重置密码流程）。
- 编辑邮箱/手机（涉及验证与安全，本期仅展示；编辑资料仅 displayName + avatar）。

## Technical Approach

- **前端**：新增 `ProfilePage.tsx`（我的）、`UserProfilePage.tsx`（他人，或共用组件通过路由区分）；复用现有 Header、Card、Button、Input；帖子列表复用或抽离 `PostList`/单条展示。
- **后端**：ForumPostService 增加按 authorId 查询帖子（或扩展 getPostList）；auth 服务增加 updateProfile(currentUserId, { displayName?, avatar? })；auth API 增加 update-profile 路由。
- **他人主页访问控制**：`/user/:id` 不放在 ProtectedRoute 内，未登录也可访问；若需登录再包一层或接口鉴权。

## Implementation Plan (分步 / 子任务)

| 步骤 | 内容 | 依赖 |
|------|------|------|
| **1. 页面骨架与展示** | 新增 `/profile`、`/user/:id` 路由与页面组件；我的页展示 authStore.user，他人页用 getUserDetail(id)；Header 用户名可点击进 `/profile`。 | 无 |
| **2. 我的帖子列表** | 后端：帖子 list 支持 authorId 参数；前端：我的个人中心调用「按当前用户 id 拉帖」并展示列表，点击进帖子详情。 | 步骤 1 |
| **3. 编辑资料** | 后端：auth 新增 update-profile（displayName、avatar）；前端：我的个人中心增加编辑表单，提交后刷新 store 与 UI。 | 步骤 1 |
| **4. 作者跳转** | 帖子详情/评论中作者名或头像可点击，跳转 `/user/:id`。 | 步骤 1 |

步骤 2 与 3 可并行开发（前后端各自子任务）；步骤 4 可与 1 一起做（仅前端链接）。

## Technical Notes

- 参考页面：`Frontend/src/pages/HomePage.tsx`（布局与 Header）、`LoginPage.tsx`（Card 与表单项风格）。
- 规范：`.trellis/spec/frontend/index.md`、`design-guide.md`；后端若动 API 需看 `api-core.md`、`security.md`。
- 前端 API：`Frontend/src/api/auth.ts` 已有 getCurrentUser、getUserDetail。
