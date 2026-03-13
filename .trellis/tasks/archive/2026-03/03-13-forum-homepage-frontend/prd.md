# forum-homepage-frontend

## Goal

开发论坛首页前端页面，两栏布局：左侧分类选择器 + 右侧帖子列表。

## Requirements

### 1. 类型定义 (types/post.ts)

创建帖子相关 TypeScript 类型：
- `Post` - 帖子类型
- `UserInfo` - 用户信息
- `Category` - 分类
- `PostListParams` - 帖子列表请求参数
- `PostListResponse` - 帖子列表响应
- `CategoryListResponse` - 分类列表响应

### 2. API 层 (api/post.ts)

创建帖子相关 API 函数：
- `getCategoryList()` - 获取分类列表
- `getPostList(params)` - 获取帖子列表（支持分类筛选）

### 3. 状态管理 (stores/postStore.ts)

使用 Zustand 创建 `postStore`：
- 状态：`categories`、`selectedCategoryId`、`posts`、`isLoading`、`error`
- 方法：`fetchCategories()`、`fetchPosts(categoryId)`、`setSelectedCategory(categoryId)`

### 4. 组件开发

#### CategorySidebar (components/CategorySidebar.tsx)
- 接收分类列表和选中状态
- 显示「全部」+ 所有分类
- 当前选中项高亮
- 点击切换分类

#### PostList (components/PostList.tsx)
- 接收帖子列表
- 渲染 PostItem 列表
- 支持空状态显示

#### PostItem (components/PostItem.tsx)
- 显示：标题、摘要、作者、发布时间、统计、分类标签
- 列表模式布局
- 点击跳转到详情页

### 5. 首页布局 (pages/HomePage.tsx)

- 两栏布局：左侧 CategorySidebar + 右侧 PostList
- 页面加载时获取分类和帖子数据

## Acceptance Criteria

- [ ] types/post.ts 包含所有必要的类型定义
- [ ] api/post.ts 提供分类和帖子列表 API
- [ ] postStore 正确管理状态
- [ ] CategorySidebar 正确显示分类并支持选择
- [ ] PostList 正确显示帖子列表
- [ ] PostItem 显示完整信息（标题、摘要、作者、时间、统计、分类）
- [ ] 布局为两栏：左侧 240px 分类栏 + 右侧自适应列表

## Out of Scope

- 发帖功能
- 帖子详情页
- 点赞/收藏
- 分页

## Technical Notes

- 使用 `lucide-react` 图标
- 样式与登录页一致：slate 色系、Refined Minimal
- 使用 HashRouter 路由
