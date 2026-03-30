# 统一头像显示逻辑

## Goal

统一前端所有头像显示逻辑，按优先级 `头像 → 用户昵称首字母 → 用户名首字母 → 邮箱前缀 → 手机号` 处理，并抽离为统一的 `UserAvatar` 组件。

## What I already know

### 当前不一致问题

| 位置 | Fallback 逻辑 | 字符数 | 大写 |
|------|--------------|--------|------|
| Header.tsx | `displayName \|\| userName \|\| '?'` 取第1个字符 | 1 | ✅ |
| PostItem.tsx | `userName \|\| displayName \|\| '?'` 取第1个字符 | 1 | ✅ |
| PostDetailPage.tsx | `displayName \|\| userName` 取2个字符 | 2 | ✅ |
| ReplyItem.tsx | `displayName \|\| userName` 取2个字符 | 2 | ✅ |
| UserProfilePage.tsx | `displayName` 取2个字符 | 2 | ❌ |
| ProfilePage.tsx | `displayName` 取2个字符 | 2 | ❌ |

### 用户信息字段（来自 UserInfo）

```typescript
interface UserInfo {
  _id: string
  userName: string       // 用户名（系统生成）
  displayName: string    // 显示昵称（用户可改）
  phone: string
  email: string
  avatar: string
  role: string
  koobooId: string
  createdAt: number
  lastLoginAt: number
}
```

### 现有组件

- `Avatar, AvatarImage, AvatarFallback` — Radix UI 基础组件，位于 `@/components/ui/avatar.tsx`

## Assumptions (temporary)

- `displayName` 是用户可见的昵称，应优先于 `userName` 用于首字母显示
- Fallback 应取前 2 个字符（支持中文昵称显示）
- 所有首字母 fallback 应转为大写
- 邮箱/手机号作为最后 fallback 时，取前缀而非完整值

## Open Questions

* None yet — derived from code inspection

## Requirements (evolving)

1. 创建 `UserAvatar` 组件，统一头像显示逻辑
2. 优先级规则：`avatar → displayName首2字符 → userName首2字符 → 邮箱前缀 → 手机号 → '?'`
3. 支持不同尺寸配置
4. 支持传入额外的 className
5. 替换现有所有直接使用 `Avatar` + `AvatarFallback` 的地方

## Acceptance Criteria

- [x] 创建 `UserAvatar` 组件，实现统一逻辑
- [x] Header.tsx 使用新组件
- [x] PostItem.tsx 使用新组件
- [x] PostDetailPage.tsx 使用新组件（移除本地 getInitials）
- [x] ReplyItem.tsx 使用新组件（移除本地 getInitials）
- [x] UserProfilePage.tsx 使用新组件
- [x] ProfilePage.tsx 使用新组件（编辑弹窗头像）
- [x] 构建通过，无 lint 错误

## Definition of Done

- 所有头像显示使用统一组件
- 优先级逻辑一致
- 构建通过
- 无 console.error

## Out of Scope

- 修改后端头像上传逻辑
- 修改用户信息 API

## Technical Notes

### 组件设计

```tsx
interface UserAvatarProps {
  user: {
    avatar?: string
    displayName?: string
    userName?: string
    email?: string
    phone?: string
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// 尺寸映射
// sm: w-8 h-8 (32px) — 回复、评论
// md: w-10 h-10 (40px) — 帖子列表
// lg: w-16 h-16 (64px) — 侧边栏作者卡片
// xl: w-24 h-24 (96px) — 个人主页

// Fallback 优先级
// 1. displayName[0].toUpperCase()
// 2. userName[0].toUpperCase()
// 3. email[0].toUpperCase()
// 4. phone[0]
// 5. '?'
```

### 需要修改的文件

- 新建：`Frontend/src/components/UserAvatar.tsx`
- 修改：
  - `Frontend/src/components/Header.tsx`
  - `Frontend/src/components/PostItem.tsx`
  - `Frontend/src/components/PostDetailPage.tsx`
  - `Frontend/src/components/ReplyItem.tsx`
  - `Frontend/src/pages/UserProfilePage.tsx`
  - `Frontend/src/pages/ProfilePage.tsx`
