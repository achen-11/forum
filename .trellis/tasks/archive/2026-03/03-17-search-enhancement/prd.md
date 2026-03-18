# brainstorm: 首页搜索增强

## Goal

增强首页搜索功能，支持通过 tag 和分类筛选帖子，并与详情页面包屑导航无缝对接。

## What I already know

**现有代码结构**：
- 首页 `HomePage.tsx` 使用 `usePostStore` 管理状态
- `postStore` 支持 `selectedCategoryId` 筛选分类
- 已有 `searchPosts` API 支持关键词搜索（`/api/search/search`）
- 详情页点击分类跳转到 `/?category=xxx`
- 左侧边栏 `HomeSidebar` 支持分类和 tag 点击

**已发现的问题**：
- 首页未读取 URL 参数 `category` 和 `tag`
- 无 tag 筛选的 API（需要新增）

## Assumptions (temporary)

- 点击 tag 后需要新增 API 支持 tag 筛选
- 分类筛选 API 已存在 (`getPostList` 支持 categoryId)

## Open Questions

1. ~~tag 筛选方式~~ → 用户选择：修复搜索页
2. ~~分类点击行为~~ → 用户选择：首页适配
3. ~~搜索页 tag 处理~~ → 需要后端支持 tag 搜索

## 用户选择

- **tag 点击**：跳转到搜索页 `/search?tag=xxx`，搜索页需要修复处理 tag 参数
- **分类点击**：详情页跳转首页 `/?category=xxx`，首页需要适配处理 category 参数

## Requirements (evolving)

### 搜索页 (SearchPage) - 与首页布局完全一致
- [ ] 使用共享 Header 组件（与首页一致）
- [ ] 使用 HomeSidebar 左侧边栏（与首页一致）
- [ ] 右侧列表区显示搜索/筛选结果
- [ ] 支持 keyword、tag、categoryId 三种搜索模式
- [ ] 顶部显示当前搜索条件（如"搜索: xxx" 或 "标签: xxx" 或 "分类: xxx"）
- [ ] 可能需要后端新增 tag 搜索 API

### 首页 (HomePage)
- [ ] 读取 URL 参数 category
- [ ] 根据 category 自动筛选帖子
- [ ] 头部或筛选栏显示当前筛选条件（如"分类: 前端开发"）
- [ ] 支持清除筛选条件（返回全量帖子）

## Acceptance Criteria (evolving)

### 搜索页
- [ ] 布局与首页完全一致（左侧边栏 + 右侧内容区）
- [ ] 支持 keyword、tag、categoryId 三种搜索模式
- [ ] 顶部显示当前搜索条件（如"搜索: xxx"、"标签: xxx"、"分类: xxx"）
- [ ] 点击 tag 跳转到搜索页显示 tag 搜索结果
- [ ] 分页正常工作

### 首页
- [ ] 访问 `/?category=xxx` 时自动筛选对应分类的帖子
- [ ] 头部或筛选栏显示当前选中的分类
- [ ] 点击"全部"或清除按钮可返回全量帖子
- [ ] tag 点击仍跳转到搜索页（保持现有行为）

## Out of Scope

- 搜索历史记录
- 多 tag 组合搜索
- 分类和 tag 同时筛选

## Technical Notes

**涉及文件**：
- `Frontend/src/pages/HomePage.tsx` - 首页
- `Frontend/src/stores/postStore.ts` - 状态管理
- `Frontend/src/api/post.ts` - API 接口
- `Frontend/src/components/HomeSidebar.tsx` - 左侧边栏

**后端 API 需要确认**：
- `/api/forum/post/list` - 支持 categoryId（已存在）
- `/api/search/search` - 支持 keyword + categoryId（已存在）
- tag 筛选 API - 需要确认或新增
