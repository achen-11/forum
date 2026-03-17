# Task: Tags 功能

## Goal

实现论坛 Tags 功能，支持帖子标签（混合模式：预定义 + 用户自定义）

## What I already know

* 项目使用 Kooboo 后端 + React 前端
* HomeSidebar 已预留 Tags 占位区域（硬编码）
* 后端使用 ksql ORM
* 现有模型：Forum_Post, Forum_Category, Forum_User, Forum_Reply

## Requirements

- [ ] 分类表新增 "是否在首页展示" 字段 `showOnHome` (默认 true)
- [ ] 后端支持 Tags 的 CRUD（混合模式：预定义 + 用户自定义）
- [ ] 创建 Forum_Tag 模型（name, color, usageCount）
- [ ] 帖子与标签多对多关联（Forum_Post_Tag）
- [ ] 前端首页侧边栏显示 Tags 列表（点击跳转搜索页）
- [ ] 发帖页面支持选择/创建 Tags
- [ ] 帖子详情页显示 Tags
- [ ] 搜索功能支持按标签筛选

## Acceptance Criteria

- [ ] 后端 API 支持 Tags 列表、创建操作
- [ ] 首页侧边栏显示 Tags（可点击跳转搜索）
- [ ] 发帖时可选择预定义标签或创建新标签
- [ ] 帖子详情页显示关联的 Tags
- [ ] 搜索结果页支持 tag 参数过滤

## Technical Approach

**后端**:
1. 在 Forum_Category 添加 `showOnHome` 字段（Boolean，默认 true）
2. 创建 Forum_Tag 模型：name, color, usageCount, createdAt
3. 创建关联表 Forum_Post_Tag：postId, tagId
4. API: GET /api/forum/tag/list, POST /api/forum/tag/create

**前端**:
1. HomeSidebar: 从 API 获取 Tags，点击跳转 /search?tag=xxx
2. CreatePostPage: 添加 Tag 选择器（支持选择预定义 + 创建新标签）
3. PostDetailPage: 显示帖子关联的 Tags

## Open Questions

* [x] Tags 使用方式：混合模式（预定义 + 用户自定义） - 已确认
* [x] 标签点击行为：点击跳转搜索页过滤 - 已确认
