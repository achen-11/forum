# 已解决帖子功能

## Goal

在论坛帖子中添加"已解决"状态标识，允许帖主将某个回复标记为"最佳答案/解决方案"。

## What I already know

* Forum_Post 模型当前**没有** `isSolved` 字段
* Forum_Reply 模型当前**没有** `isAccepted` 或 `isSolution` 字段
* Frontend Post 类型**没有** `isSolved` 字段
* ProfilePage 中"已解决数"使用硬编码公式 `Math.floor(commentsCount / 5)`
* 类似功能参考：StackOverflow 的"Accepted Answer"

## Assumptions (temporary)

* "已解决"由帖主自己标记（不能由他人标记）
* 一个帖子只能有一个"已解决"回复
* 标记后可以取消标记
* 仅帖主可以看到"标记为解决方案"按钮
* **该字段是可选的**：只有 Q&A/技术支持类帖子需要，资讯类帖子不需要

## Decision (ADR-lite)

**Context**: 需要设计"已解决"状态存储在哪一级
**Decision**: 采用**方案 A - 帖子级标记**，字段为可选
**Consequences**:
- Post 添加 `isSolved: boolean` 和 `acceptedReplyId: string | null`
- 标记时更新帖子这两个字段，查询效率高
- 资讯类帖子 `isSolved=false`，不影响现有逻辑

## Open Questions

* **核心设计**: "已解决"应该标记在帖子上还是回复上？

## Requirements (evolving)

### 数据模型
* [ ] Post 模型添加 `isSolved: boolean`（可选字段，默认 false）
* [ ] Post 模型添加 `acceptedReplyId: string | null`（标记最佳回复 ID）
* [ ] Reply 模型添加 `isAccepted: boolean`（标记该回复是否被接受为解决方案）
* [ ] Reply 模型添加 `likeCount: number`（点赞数）
* [ ] Reply 模型添加 `isLiked: boolean`（当前用户是否点赞，需单独查询）

### 后端 API
* [ ] API：标记/取消标记回复为解决方案（仅帖主或管理员可操作）
* [ ] API：获取用户已解决帖子数
* [ ] API：点赞/取消点赞回复
* [ ] API：获取回复的点赞状态和点赞数
* [ ] API：帖子详情返回 `isSolved` 和 `acceptedReplyId`

### 前端 - 帖子列表
* [ ] PostItem：已解决帖子显示"已解决"徽章
* [ ] PostItem：点击"已解决"徽章跳转到详情页并滚动到对应回复

### 前端 - 帖子详情页
* [ ] 已解决帖子顶部显示"已解决 ✓"标识，点击滚动到对应回复
* [ ] 每条回复底部显示点赞按钮和点赞数
* [ ] 帖主或管理员：在回复底部看到"标记为解决方案"按钮
* [ ] 标记后回复显示"最佳答案"标识

### 前端 - ProfilePage
* [ ] 获取真实已解决帖子数量
* [ ] 替换硬编码公式

### 前端 - 个人中心「我的帖子」
* [ ] 已解决帖子显示"已解决"标识

## Acceptance Criteria

* [ ] 帖主或管理员可以将某个回复标记为"解决方案"
* [ ] 标记后帖子在列表中显示"已解决"标识
* [ ] 已解决帖子详情页顶部有标识，点击滚动到最佳回复
* [ ] ProfilePage 显示真实的已解决帖子数量
* [ ] 每条回复可以点赞/取消点赞
* [ ] 同一帖子的多个回复不能同时标记为解决方案

## Definition of Done

* Tests added/updated (unit/integration where appropriate)
* Lint / typecheck / CI green
* Docs/notes updated if behavior changes

## Out of Scope

* 解决者的积分/奖励系统
* 通知系统（通知回答者被标记）
* 管理员强制标记功能

## Technical Notes

### Existing patterns found

* `Forum_Like` 模型已支持 `targetType: 'post' | 'reply'`
* `toggleLike(targetType, targetId)` 已支持 reply，但未更新 Reply 的 likeCount
* `isLiked(targetType, targetId)` 已支持 reply
* `isAdmin()` 函数检查 `role === 'admin' || role === 'superadmin'`

### Files that need modification

**后端：**
* `src/code/Models/Forum_Post.ts` - 添加 `isSolved`, `acceptedReplyId` 字段
* `src/code/Models/Forum_Reply.ts` - 添加 `likeCount`, `isAccepted` 字段
* `src/code/Services/ForumPostService.ts` - 修复 reply 的 likeCount 更新
* `src/api/forum/post.ts` - 添加标记解决方案 API、已解决帖子数 API
* `src/api/forum/admin_user.ts` - 可复用 `isAdmin()` 函数

**前端：**
* `Frontend/src/types/post.ts` - 添加 `isSolved`, `acceptedReplyId`, `likeCount`, `isAccepted` 类型
* `Frontend/src/api/post.ts` - 添加相关 API 调用
* `Frontend/src/components/PostItem.tsx` - 显示"已解决"徽章
* `Frontend/src/pages/PostDetailPage.tsx` - 已解决标识 + 标记按钮 + 回复点赞
