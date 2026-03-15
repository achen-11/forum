# brainstorm: 发帖功能和帖子详情页

## Goal

为论坛系统实现发帖功能和帖子详情页，使用户能够创建新帖子并查看帖子详情。

## What I already know

基于现有代码分析：

- **已实现**：
  - 登录页面：`/login`
  - 首页：`/` - 分类侧边栏 + 帖子列表
  - 帖子数据模型：`Forum_Post` (标题、内容、分类、作者、创建时间等)
  - 发帖按钮已存在于首页 Header，路由 `/post/new` 已预留但页面未实现

- **技术栈**：
  - 前端：React + Vite + Zustand + TailwindCSS
  - 后端：Kooboo API (TypeScript)
  - 状态管理：Zustand (`postStore.ts`, `authStore.ts`)
  - API 请求：`http.get/post` 封装

- **现有 API** (`/api/forum/post/`)：
  - `categories` - 获取分类列表
  - `list` - 获取帖子列表（支持 categoryId 筛选）
  - `seed` - 生成测试数据

## Assumptions (temporary)

- 发帖需要登录后才能操作
- 帖子包含：标题、内容、分类
- 帖子详情页显示：标题、内容、作者、时间、阅读数、评论数
- 评论功能可以先不做（MVP）

## Open Questions

1. ~~帖子详情页是否需要评论功能？~~ → **需要** (选项 B)
2. ~~帖子内容是否支持富文本/Markdown？~~ → **富文本编辑器 + 粘贴图片支持** (选项 C)
3. ~~图片上传方案~~ → **上传到 Kooboo 静态资源，返回 URL** (选项 B)

**待确认：**
4. 评论排序方式？ → **默认倒序，可切换**

## Requirements (evolving)

- [ ] 发帖页面 (`/post/new`) - 用户登录后可发帖
- [ ] 发帖 API - 后端保存帖子数据，支持图片上传到 Kooboo 静态资源
- [ ] 帖子详情页 (`/post/:id`) - 显示帖子完整内容
- [ ] 帖子详情 API - 获取帖子详情
- [ ] 评论功能 - 查看和添加评论，默认倒序，可切换排序

## Acceptance Criteria (evolving)

- [x] 用户点击首页「发帖」按钮进入发帖页面
- [x] 发帖表单包含：标题输入框、分类选择器、内容编辑器
- [x] 发帖成功后跳转到帖子详情页
- [x] 帖子详情页正确显示帖子所有信息
- [x] 评论功能正常工作，支持排序切换

## Definition of Done (team quality bar)

- 前端 lint / typecheck 通过
- 后端 API 按规范实现
- 手动测试发帖和查看详情功能正常

## Out of Scope (explicit)

- ~~帖子编辑/删除功能~~（暂不做）
- ~~帖子点赞功能~~（暂不做）

## Research Notes

### 现有代码模式

**后端 API** (`src/api/forum/post.ts`):
- `categories` - 获取分类列表
- `list` - 获取帖子列表

**后端 Service** (`src/code/Services/ForumPostService.ts`):
- `getCategoryList()` - 获取分类
- `getPostList(categoryId?)` - 获取帖子列表，关联查询作者和分类

**后端 Model**:
- `Forum_Post` - 帖子模型（title, content, authorId, categoryId, viewCount, replyCount 等）
- `Forum_Reply` - 回复/评论模型（postId, parentId, authorId, content）

**前端**:
- API: `Frontend/src/api/post.ts`
- Types: `Frontend/src/types/post.ts`
- 路由: `App.tsx` - 已有 `/post/new` 路由预留

### 富文本编辑器选型

可选方案：

1. **TipTap** - 基于 ProseMirror，现代 React 友好，社区活跃，支持粘贴图片
2. **Quill** - 经典富文本编辑器，稳定可靠
3. **CKEditor** - 功能强大但较重

**推荐**: TipTap

