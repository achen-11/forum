# 用户详情页优化

## Goal

根据设计稿优化用户详情页 (UserProfilePage)，参考 Enterprise Forum 设计风格重构 UI，呈现更丰富的用户信息和社交互动数据。

## Requirements

### 后端任务
- [ ] 创建 `Forum_Follow` Model (关注关系: followerId, followingId)
- [ ] 创建 Follow/Unfollow API
- [ ] 创建 `getUserComments(userId)` API - 获取用户的评论列表
- [ ] 创建 `getUserFollowers(userId)` API - 获取用户粉丝数
- [ ] 创建 `getUserFollowing(userId)` API - 获取用户关注数
- [ ] Activity Tab 简化: Activity = Posts + Replies (无需新建表，聚合现有数据)

### 前端任务
- [ ] UI 重构: Profile Card 区域重新设计
- [ ] Stats 区域: 新增 Posts/Followers/Awards 统计卡片 (Awards 占位)
- [ ] Tabs 功能: Posts / Comments / Activity 切换
- [ ] Posts 列表: 样式优化 (分类标签、互动数据展示)
- [ ] Comments Tab: 显示用户评论列表
- [ ] Activity Tab: 显示 Posts + Replies 列表
- [ ] Follow 按钮: 功能完整 (关注/取消关注)
- [ ] Message 按钮: 仅 UI 样式展示

## Out of Scope

- 私信/Message 功能
- Awards/Badge 成就系统 (单独任务 03-18-badge-system)
- Awards 数据用占位符替代 (显示 0)

## Badge 系统后续任务

已创建单独任务: `03-18-badge-system`

## Technical Notes

### 后端需新增的 Model
```typescript
Forum_Follow = {
  followerId: string,   // 关注者
  followingId: string, // 被关注者
  createdAt: timestamp
}
```

### 后端需新增的 API
| API | 方法 | 说明 |
|-----|------|------|
| `/api/forum/auth/follow` | POST | 关注/取消关注用户 |
| `/api/forum/auth/user-comments` | GET | 获取用户评论列表 |
| `/api/forum/auth/user-followers` | GET | 获取用户粉丝数 |
| `/api/forum/auth/user-following` | GET | 获取用户关注数 |

### 相关文件
- 前端页面: `Frontend/src/pages/UserProfilePage.tsx`
- 后端 Service: `src/code/Services/auth.ts`
- Model: `src/code/Models/Forum_User.ts`
