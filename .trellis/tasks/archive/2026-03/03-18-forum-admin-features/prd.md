# brainstorm: 论坛管理端功能规划

## Goal

在 admin 分支上开发论坛管理端，为管理员提供后台运营能力。

## What I already know

### 现有模型结构
| 模型 | 字段 |
|------|------|
| Forum_Post | title, content, authorId, categoryId, viewCount, replyCount, likeCount, isPinned, isEdited, editedAt |
| Forum_Reply | postId, parentId, authorId, content |
| Forum_User | userName, displayName, password, email, phone, avatar, role (默认'user'), koobooId |
| Forum_Category | name, description, parentId, sortOrder, showOnHome |
| Forum_Tag | name, color, usageCount |

### 现有前端页面（用户端）
- LoginPage, HomePage, SearchPage, PostDetailPage, ProfilePage, UserProfilePage

### 已有角色系统
- Forum_User.role 默认为 'user'
- 需要 admin 角色

### 已有多级回复支持
- Forum_Reply.parentId 支持嵌套
- 需要开发 admin 端来管理内容

## Implementation Plan

每个任务完成后端 → curl 验证 → 前端 → commit

| # | 任务 | 模块 |
|---|------|------|
| 1 | 04-01-content-management | 内容管理 - 帖子删除/置顶、回复管理 |
| 2 | 04-02-category-management | 分类管理 - 分类 CRUD、排序、首页展示控制 |
| 3 | 04-03-tag-management | 标签管理 - 标签 CRUD、颜色管理 |
| 4 | 04-04-user-management | 用户管理 - 用户列表、角色变更、封禁/解封 |
| 5 | 04-05-admin-log | 操作日志 - 完整追溯，支持筛选和分页 |

## Requirements (evolving)

* [ ] 内容管理 - 帖子删除/置顶、回复管理（直接发布，事后管理）
* [ ] 分类管理 - 分类 CRUD、排序、首页展示控制
* [ ] 标签管理 - 标签 CRUD、颜色管理
* [ ] 用户管理 - 用户列表、角色变更、封禁/解封
* [ ] 角色体系 - 超级管理员(db 直接设置)、管理员(可被提升)、普通用户
* [ ] 操作日志 - 完整追溯（操作者、时间、操作类型、对象类型/ID、变更详情），支持筛选和分页
* [ ] 软删除 - 所有删除操作使用软删除（有记录）

## Acceptance Criteria (evolving)

* [ ] 管理员可以登录管理后台
* [ ] 管理员可以管理（审核/删除/置顶）帖子
* [ ] 管理员可以管理回复
* [ ] 管理员可以增删改分类
* [ ] 管理员可以增删改标签
* [ ] 管理员可以查看用户列表、变更用户角色、封禁用户

## Out of Scope

* 用户端功能优化（除非与 admin 相关）
* 批量操作
* 板块/分区管理
* 敏感词过滤

## Technical Notes

### 相关文件
- Models: `src/code/Models/`
- Backend APIs: `src/api/forum/`
- Frontend: `Frontend/src/pages/`, `Frontend/src/components/`
- Auth: `Frontend/src/stores/authStore.ts`

### 架构决策
- Admin 与用户端同前端，通过 `/admin/*` 路由隔离
- 管理员需要 role='admin' 或 role='superadmin'
- 所有删除操作使用软删除（模型已有 softDelete: true）

### 需要新增的模型
- Forum_AdminLog - 操作日志模型
