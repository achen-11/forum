# brainstorm: 论坛通知模块

## Goal

为论坛用户创建一套通知系统，用于提醒用户关于其帖子/评论被回复、被点赞、被关注等重要事件。

## What I already know

### 现有论坛模型结构
| Model | Key Fields |
|-------|-----------|
| Forum_User | _id, userName, displayName, email, avatar |
| Forum_Post | _id, title, authorId, replyCount, likeCount |
| Forum_Reply | _id, postId, authorId, parentId, rootReplyId |
| Forum_Follow | _id, followerId, followingId |
| Forum_Like | _id, userId, targetType, targetId |

### 现有的用户行为触发点
| Action | Location |
|--------|----------|
| Post Created | ForumPostService.createPost() |
| Reply Created | ForumPostService.createReply() |
| Like Toggled | ForumPostService.toggleLike() |
| Post Marked Solution | ForumPostService.markSolution() |
| Follow User | ForumUserService.followUser() |

### 现有基础设施
- Header 有 bell icon 占位符 (无下拉菜单)
- ProfilePage 有"通知设置"占位 UI
- AuthService 有 sendEmailCode() 方法可复用
- k.cache 可用于存储未读计数
- JWT token 可包含通知计数

### 无现有通知模块
- 无 Notification Model
- 无 Notification Service
- 无 Notification API
- 无通知前端组件

## Assumptions (temporary)

- 使用 WebSocket 实现实时通知推送
- 通知存储在 Kooboo 数据库中
- 前端使用 Vue 3 + Zustand

## Open Questions

### 核心问题 (按优先级)
1. [x] ~~**通知类型**: 需要哪些通知类型？（回复、点赞、关注、系统通知...）~~
   → 回复、点赞、关注、最佳答案 + 系统通知（MVP）
2. [x] ~~**实时性**: 实时推送 (WebSocket) vs 轮询 vs 仅站内信？~~
   → 使用 WebSocket，参考规范: `.trellis/spec/backend/websocket.md`
3. [x] ~~**通知存储**: 站内通知存储多长时间？是否需要已读/未读状态？~~
   → 永久存储 + 已读/未读状态（以后可添加定时任务清理）
4. [x] ~~**触发方式**: 通知触发是同步还是异步？（是否影响主业务流程）~~
   → 同步触发 + 异常捕获，失败不影响主流程

### 后续任务
- @提及 通知 → 单独任务，等通知模块完成后实施

## Requirements (evolving)

- [x] 创建 Forum_Notification Model
- [x] 创建通知 Service
- [x] API: 获取通知列表
- [x] API: 标记已读
- [x] 前端: 通知列表页面/组件
- [x] 前端: 未读计数显示

## Acceptance Criteria (evolving)

- [ ] 用户可以在站内收到通知
- [ ] 用户可以查看通知列表
- [ ] 用户可以标记通知为已读
- [ ] 通知图标显示未读数量

## Out of Scope (explicit)

- @提及 通知（后续单独任务）
- 邮件通知
- 推送通知 (PWA/WebPush)
- 通知 email digest

## Technical Notes

### 相关文件
- ForumPostService: `src/code/Services/ForumPostService.ts`
- ForumUserService: `src/code/Services/ForumUserService.ts`
- Header: `Frontend/src/components/Header.tsx`
- ProfilePage: `Frontend/src/pages/ProfilePage.tsx`

### API Response Format
```typescript
successResponse(data, message)  // { code: 200, data, message: 'success' }
failResponse(msg, code)         // { code: 400, message: msg }
```

### WebSocket 规范
参考: `.trellis/spec/backend/websocket.md`
