# forum-homepage-backend

## Goal

开发论坛首页后端 API，提供分类列表和帖子列表接口。

## Parent Task

- `03-13-forum-homepage` - 论坛首页开发

## Requirements

### Plan 阶段

#### 任务边界

1. **影响文件**：
   - 新增：`src/code/Services/ForumPostService.ts`
   - 新增：`src/api/forum/post.ts`
   - 无需修改现有 Model（Forum_Post、Forum_Category 已存在）

2. **API 接口**：
   - `GET /api/forum/post/categories` - 获取分类列表
   - `GET /api/forum/post/list` - 获取帖子列表（支持分类筛选）

3. **接口参数**：
   - `list` 接口支持 `categoryId` 可选参数

### Model 阶段

无需修改，数据模型已存在：
- Forum_Category（_id, name, description, parentId, sortOrder, timestamps, softDelete）
- Forum_Post（_id, title, content, authorId, categoryId, viewCount, replyCount, isPinned, timestamps, softDelete）

### Service 阶段

创建 `ForumPostService.ts`，提供以下方法：

1. `getCategoryList()` - 获取分类列表
   - 返回所有未删除的分类
   - 按 sortOrder 升序排列

2. `getPostList(categoryId?: string)` - 获取帖子列表
   - 支持按 categoryId 筛选
   - 置顶帖（isPinned=true）排在最前面
   - 其他按 createdAt 降序排列
   - 关联查询 author（用户信息）和 category（分类信息）

### API 阶段

创建 `api/forum/post.ts`，定义接口：

1. `GET /api/forum/post/categories`
   - 无参数
   - 返回分类列表

2. `GET /api/forum/post/list`
   - 参数：`categoryId`（可选）
   - 返回帖子列表

### Verify 阶段

- 运行后端检查命令验证
- 确保无 lint 错误

## Acceptance Criteria

- [ ] `GET /api/forum/post/categories` 返回分类列表
- [ ] `GET /api/forum/post/list` 返回帖子列表
- [ ] `GET /api/forum/post/list?categoryId=xxx` 返回指定分类的帖子
- [ ] 置顶帖显示在列表顶部
- [ ] 帖子包含 author 和 category 关联信息

## Technical Approach

### 目录结构

```
src/
├── api/
│   └── forum/
│       └── post.ts          # API 端点
└── code/
    └── Services/
        └── ForumPostService.ts  # 业务逻辑
```

### 响应格式

统一使用响应封装：

```typescript
// 成功
{ success: true, data: {...} }

// 失败
{ success: false, message: '错误信息' }
```

## Out of Scope

- 发帖 API
- 帖子详情 API
- 点赞/评论 API
- 用户认证（复用现有 auth 模块）
