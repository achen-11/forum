# 帖子互动功能后端 API

## Goal
开发帖子互动功能的后端 API，支持点赞、收藏、分享、获取相关帖子。

## Requirements

### 1. 点赞功能
- POST `/api/forum/like` - 点赞或取消点赞
- 传参：targetType (post/reply), targetId
- 已点赞时取消，未点赞时点赞
- 返回当前点赞状态和数量

### 2. 收藏功能
- POST `/api/forum/collect` - 收藏或取消收藏
- 传参：postId
- 已收藏时取消收藏，未收藏时添加收藏
- 返回当前收藏状态

### 3. 互动状态查询
- GET `/api/forum/post/{id}/status`
- 返回：isLiked, isCollected, likeCount

### 4. 相关帖子
- GET `/api/forum/post/{id}/related`
- 返回同分类或同标签的热门帖子（排除当前帖子）

### 5. 分享统计
- POST `/api/forum/post/{id}/share`
- 增加分享次数

## Acceptance Criteria
- [ ] 点赞/取消点赞 API 正常工作
- [ ] 收藏/取消收藏 API 正常工作
- [ ] 互动状态查询 API 正常返回
- [ ] 相关帖子 API 返回正确数据
- [ ] 分享统计 API 正常工作

## Technical Notes
- 需要创建 Forum_Collection 收藏表
- 使用 Kooboo 后端开发规范
