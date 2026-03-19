# Badge 成就徽章系统

## Goal

为论坛用户创建一套成就徽章系统，用户可以通过完成特定行为获得徽章，徽章会在用户详情页展示。

## Background

设计稿中用户详情页有 "Awards" 统计卡片 (显示获得的徽章数量)，但目前后端没有对应的徽章/成就系统。

## What I already know

### 设计稿需求
- 用户详情页 Stats 区域有 "Awards" 统计卡片
- Awards 显示用户获得的成就徽章数量 (设计稿示例: 15)

### Badge 典型例子
- "新人报到" - 完成注册
- "首发帖" - 发布第一篇帖子
- "话唠" - 评论数超过 100
- "人气王" - 帖子获得 100+ 点赞
- "月度之星" - 每月评选

## Open Questions

- [ ] **徽章获取方式**: 自动触发还是需要管理员审核？
- [ ] **徽章类型**: 需要哪些徽章？是否需要预设模板？
- [ ] **Badge Model**: 徽章存储用什么结构？(Forum_Badge + Forum_User_Badge 还是直接在 User 上加字段)
- [ ] **Awards 显示**: Awards 数量 vs 徽章列表，是否都需要展示？

## Requirements (TBD)

- [ ] 创建 Forum_Badge Model (徽章定义表)
- [ ] 创建 Forum_User_Badge Model (用户-徽章关联表)
- [ ] 设计徽章获取规则/触发条件
- [ ] 后端 API: 获取用户徽章列表
- [ ] 后端 API: 更新用户徽章 (自动触发或手动)
- [ ] 前端: 用户详情页 Awards 卡片显示徽章数量
- [ ] 前端: 可选 - 徽章详情弹窗/页面

## Out of Scope

- 管理员后台管理徽章
- 徽章图片上传
- 排行榜功能

## Technical Notes

### 相关文件
- Forum_User Model: `src/code/Models/Forum_User.ts`
- 现有服务: `src/code/Services/auth.ts`, `src/code/Services/ForumPostService.ts`
