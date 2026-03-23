# Profile 页面重构

## Goal

采用 Stitch 设计稿完整重构个人中心页面，提升用户体验和视觉设计。

## What I already know

### Stitch 设计稿特点
1. **顶部导航栏** - 带搜索框、通知铃铛（带红点）、用户信息
2. **左侧边栏** - Profile / My Posts / Saved Posts / Notifications / Settings / Sign Out
3. **Profile Header Card**:
   - 渐变背景封面图 (from-primary/20 to-primary/5)
   - 大头像 (32x32 rounded-2xl) + 相机编辑按钮
   - 用户名 + 职位/团队信息
   - Edit Profile / Share 按钮
   - About Me 个人简介
   - Contact Details (邮箱、位置、加入时间)
   - Skills/Tags 展示
4. **账户安全卡片** - 2FA 开关、修改密码、登录会话
5. **通知偏好卡片** - 邮件提醒、浏览器推送、周刊摘要 开关
6. **论坛活动统计** - Posts Created / Comments / Likes Received / Solved Tasks

### 当前实现
- `ProfilePage.tsx` - 用户个人中心，只有基本信息 + 发帖列表
- `UserProfilePage.tsx` - 访客查看他人 profile

### 设计风格
- TailwindCSS + Lucide icons
- Material Symbols Outlined (Stitch 用的是这个，但当前项目用 Lucide)
- 颜色: primary (#1111d4), background-light (#f6f6f8), background-dark (#101022)
- 深色模式支持

## Requirements

### Layout Structure
- [ ] 顶部导航栏 (Header) - Logo、搜索框、通知、用户头像
- [ ] 左侧边栏 - 导航菜单 (Profile / My Posts / Saved Posts / Notifications / Settings / Sign Out)
- [ ] 主内容区 - 右侧多卡片布局

### Profile Header Card
- [ ] 渐变背景封面 (h-32, bg-gradient-to-r from-primary/20 to-primary/5)
- [ ] 头像区域 (w-32 h-32 rounded-2xl, border-4 border-white, 相机编辑按钮)
- [ ] 用户名 + 职位信息
- [ ] Edit Profile + Share 按钮
- [ ] About Me 个人简介区块
- [ ] Contact Details 区块 (邮箱、位置、加入时间)
- [ ] Skills/Tags 标签展示

### Account Security Card
- [ ] 2FA 开关 (toggle switch)
- [ ] 修改密码入口
- [ ] 登录会话入口

### Notification Preferences Card
- [ ] 邮件提醒开关
- [ ] 浏览器推送开关
- [ ] 周刊摘要开关

### Forum Activity Card
- [ ] Posts Created 统计
- [ ] Comments 统计
- [ ] Likes Received 统计
- [ ] Solved Tasks 统计

### My Posts Section
- [ ] 保存的帖子列表 (带 badge 数量)
- [ ] 发帖列表

### Navigation
- [ ] Sidebar 高亮当前页
- [ ] 退出登录功能

## Out of Scope

- 用户查看他人 profile 页面 (UserProfilePage.tsx) - 暂不改动
- 通知中心的完整实现 - 仅 UI 占位

## Technical Approach

### 文件结构
```
Frontend/src/pages/ProfilePage.tsx  # 重构目标
```

### 组件复用
- 使用现有的 UI 组件 (Card, Button, Avatar, Badge, Tabs 等)
- 图标使用 Lucide React (现有项目规范)
- 样式使用 TailwindCSS

### 实现步骤
1. 重构布局结构 (Header + Sidebar + Main)
2. Profile Header Card
3. Account Security Card
4. Notification Preferences Card
5. Forum Activity Card
6. My Posts Section
7. 深色模式支持

## Design Reference

参考 `.trellis/workspace/cursor-agent/stitch/_4/code.html` 的完整设计