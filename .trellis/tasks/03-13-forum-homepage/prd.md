# forum-homepage

## Goal

开发论坛首页，支持分类筛选和帖子列表展示，采用两栏布局（左侧分类选择器 + 右侧帖子列表）。

## Requirements

### 功能需求

1. **两栏布局**
   - 左侧：分类选择器（固定宽度 240px）
   - 右侧：帖子列表（flex-1 自适应）

2. **分类选择器**
   - 显示所有论坛分类
   - 支持「全部」选项
   - 当前选中分类高亮显示
   - 点击切换分类

3. **帖子列表**
   - 支持置顶帖（置顶帖显示在列表顶部）
   - 列表模式：每行显示标题 + 作者 + 时间 + 统计
   - 按发布时间倒序排列
   - 显示帖子摘要

4. **帖子卡片信息**
   - 标题
   - 摘要
   - 作者头像 + 用户名
   - 发布时间
   - 点赞数 + 评论数
   - 所属分类标签

5. **交互**
   - 点击帖子卡片跳转到详情页
   - 分类切换刷新帖子列表

## Acceptance Criteria

- [ ] 左侧分类选择器正确显示所有分类
- [ ] 点击分类可以筛选帖子
- [ ] 置顶帖显示在列表顶部
- [ ] 帖子列表正确显示标题、摘要、作者、发布时间、统计信息
- [ ] 点击帖子可以跳转到详情页

## Technical Approach

### 前端

- 创建 `HomePage.tsx` 改为论坛首页布局
- 创建 `CategorySidebar` 组件（左侧分类）
- 创建 `PostList` 组件（右侧列表）
- 创建 `PostItem` 组件（帖子列表项）
- 创建 `types/post.ts` 定义帖子类型
- 创建 `api/post.ts` 定义帖子 API
- 使用 Zustand 创建 `postStore` 管理帖子和分类状态

### 后端

- 创建 `Models/Forum_Category.ts` 分类数据模型（如果尚未创建）
- 创建 `Services/ForumPostService.ts` 帖子相关服务
- 创建 `api/forum/post.ts` 帖子 API 接口

### 数据模型

Forum_Post 已有字段：
- title: 标题
- content: 内容
- summary: 摘要
- isTop: 是否置顶
- isEssence: 是否精华
- categoryId: 分类ID
- authorId: 作者ID
- viewCount: 浏览数
- likeCount: 点赞数
- replyCount: 评论数
- createdAt: 创建时间
- updatedAt: 更新时间

Forum_Category 已有字段：
- name: 分类名称
- description: 描述
- icon: 图标
- sortOrder: 排序

## Out of Scope

- 发帖功能（后续任务）
- 帖子详情页（后续任务）
- 点赞/收藏功能（后续任务）
- 搜索功能（后续任务）
- 分页加载（当前先做无限滚动或简单加载）

## Technical Notes

- 参照现有 auth 模块的目录结构
- 前端 API 调用参照 `api/auth.ts`
- 状态管理参照 `stores/authStore.ts`
- UI 风格保持与登录页一致的 Refined Minimal 风格
