# 多级回复与删除权限功能

## Goal

实现三个功能：
1. **多级回复**：支持嵌套回复（最多 2 层），楼内回复显示"回复 XXX"
2. **删除权限**：帖子和回复支持删除，区分管理员和普通用户权限
3. **帖子编辑**：帖子支持编辑，编辑后显示"已编辑"标记

## What I already know

### 后端现状
- `Forum_Reply` 模型已有 `parentId` 字段支持嵌套
- `Forum_User` 模型有 `role` 字段（默认 'user'）

### 新增字段
```typescript
// Forum_Reply 表
rootReplyId: string  // 顶级回复的_id，顶级回复此字段为空或等于自己的_id
```

### 前端现状
- 树形嵌套结构处理复杂
- 需要递归组装 children

## Confirmed Requirements

### 1. 多级回复
- [ ] 前端评论列表支持嵌套显示
- [ ] 楼内回复（3级+）显示"回复 XXX"（被回复者用户名）
- [ ] 收起/展开功能：显示"查看 N 条回复"，默认收起

### 2. 删除权限
- [ ] 后端添加帖子删除 API（含权限校验）
- [ ] 后端添加回复删除 API（含权限校验）
- [ ] 前端添加删除按钮（根据权限显示）

**权限规则：**
| 角色 | 帖子删除 | 回复删除 |
|------|----------|----------|
| 管理员 | 可删除任何人的帖子 | 可删除任何人的回复 |
| 普通用户 | 只能删除自己的帖子 | 只能删除自己的回复 |

### 3. 帖子编辑
- [ ] 后端添加帖子编辑 API（含权限校验）
- [ ] 前端添加帖子编辑功能
- [ ] 帖子编辑后显示"已编辑"标记和时间
- [ ] 管理员编辑任何帖子（带特殊标记）

**权限规则：**
| 角色 | 帖子编辑 |
|------|----------|
| 管理员 | 可编辑任何人的帖子 |
| 普通用户 | 只能编辑自己的帖子 |

### 4. 管理员特殊标记
- [ ] 管理员头像/名字旁显示标识（如：👑 或 "管理员" 标签）

### 5. rootReplyId 字段
- [ ] Forum_Reply 表添加 `rootReplyId` 字段
- [ ] 创建回复时自动填充 `rootReplyId`
- [ ] 查询接口返回扁平结构，前端按 `rootReplyId` 分组组装

## Acceptance Criteria

- [ ] 可以在帖子下直接回复（一级回复）
- [ ] 可以对任意一级回复进行回复（二级回复）
- [ ] 二级回复显示"回复 XXX"
- [ ] 管理员可以删除任何人的帖子/回复
- [ ] 普通用户只能删除自己的帖子/回复
- [ ] 管理员可以编辑任何帖子
- [ ] 普通用户只能编辑自己的帖子
- [ ] 编辑后的帖子显示"已编辑"标记
- [ ] 管理员显示特殊标识

## Out of Scope

- 封禁用户功能
- 点赞、收藏等互动功能

## Technical Notes

### 相关文件
- `src/code/Models/Forum_Reply.ts` - 回复模型
- `src/code/Models/Forum_User.ts` - 用户模型（含 role）
- `src/code/Models/Forum_Post.ts` - 帖子模型
- `src/api/forum/post.ts` - 帖子 API
- `src/code/Services/ForumPostService.ts` - 帖子服务
- `Frontend/src/pages/PostDetailPage.tsx` - 帖子详情页
- `Frontend/src/components/ReplyDrawer.tsx` - 回复抽屉

### 需要新增/修改的 API
- `POST /api/forum/post/delete` - 删除帖子
- `POST /api/forum/post/reply/delete` - 删除回复
- `POST /api/forum/post/edit` - 编辑帖子
