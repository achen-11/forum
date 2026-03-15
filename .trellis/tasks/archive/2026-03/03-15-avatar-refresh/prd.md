# Task: 修复用户头像不更新问题

## Goal

修复首页和帖子详情页的用户头像不显示的问题

## What I already know

### 问题分析
1. **PostDetailPage.tsx**（第 170-174, 265-269 行）：
   - 只使用了 `<Avatar>` 和 `<AvatarFallback>` 组件
   - **没有使用 `<AvatarImage>`** 来显示头像图片
   - 即使 `post.author.avatar` 有值也不会显示

2. **PostItem.tsx**（第 60-62 行）：
   - 使用 div 模拟头像显示，只显示首字母
   - 没有使用 Avatar 组件，也没有显示 avatar 图片

### 原因
代码中缺少将 `author.avatar` 传递给 `<AvatarImage src={...}>` 的逻辑

## Requirements

- [ ] 修复 PostDetailPage.tsx 中的帖子作者头像显示
- [ ] 修复 PostDetailPage.tsx 中的评论作者头像显示
- [ ] 修复 PostItem.tsx 中的帖子作者头像显示

## Acceptance Criteria

- [ ] 帖子详情页的作者头像能正确显示（当 author.avatar 有值时）
- [ ] 帖子详情页的评论者头像能正确显示（当 reply.author.avatar 有值时）
- [ ] 首页列表的帖子作者头像能正确显示（当 post.author.avatar 有值时）
