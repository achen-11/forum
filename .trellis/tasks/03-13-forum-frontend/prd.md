# 论坛前端页面开发

## Goal

开发 Kooboo 论坛前端页面，React + TailwindCSS + shadcn/ui。

## What I already know

* 技术栈：React 19 + TailwindCSS 4 + shadcn/ui + Vite
* 前端目录：Frontend/
* 后端 API：/api/forum/auth/*（已实现）
* 设计风格：需确定

## Requirements (evolving)

### Phase 1 页面
* 登录页
* 注册页
* 首页（帖子列表）
* 帖子详情页
* 发布帖子

### 前端 API 对接
* 登录/注册/验证码
* 帖子 CRUD

### 问题 1：~~设计风格~~

* ~~设计风格~~ → **精致极简 (Refined Minimal)** - 基于 shadcn/ui 主题

### 问题 2：优先级

* ~~页面优先级~~ → **登录页优先**（首页先占位）

## Acceptance Criteria

* [ ] 登录页 - 支持用户名/手机号/邮箱 + 密码登录
* [ ] 登录页 - 支持手机号/邮箱 + 验证码登录
* [ ] 首页 - 占位页面

## Technical Notes

* 前端目录：Frontend/src/
* API 基础路径：/api/forum/
* 状态管理：Zustand
* 路由：React Router
