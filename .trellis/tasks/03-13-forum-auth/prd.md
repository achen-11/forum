# 论坛 Auth API 开发

## Goal

开发论坛用户认证模块，支持多种登录方式和用户注册。

## What I already know

* 技术栈：React + TailwindCSS + shadcn/ui + Kooboo
* 数据模型已创建：Forum_User 在 src/code/Models/Forum_User.ts
* Kooboo 后端规范：code/Services/、api/ 目录结构

## Open Questions

* ~~登录方式：用户名/手机号/邮箱 + 密码，还是也支持验证码登录？~~ → **A. 支持验证码登录**
* ~~验证码如何发送？~~ → **参考 YJL 项目实现，使用 k.sms.aliSMS 和 SMTP 邮件**

## Requirements (MVP 功能)

### 1. 用户注册
* 用户名 + 密码注册（需验证码验证）
* 手机号 + 密码注册（需短信验证码）
* 邮箱 + 密码注册（需邮箱验证码）

### 2. 密码登录
* 用户名 + 密码
* 手机号 + 密码
* 邮箱 + 密码

### 3. 验证码登录
* 手机号 + 短信验证码
* 邮箱 + 邮箱验证码

### 4. 其他
* 忘记密码（验证码验证后重置）
* 用户登出
* 获取当前用户信息

## Acceptance Criteria

* [ ] POST /api/auth/register - 用户注册
* [ ] POST /api/auth/login - 密码登录（用户名/手机号/邮箱）
* [ ] POST /api/auth/send-code - 发送验证码（手机/邮箱）
* [ ] POST /api/auth/login-code - 验证码登录
* [ ] POST /api/auth/reset-password - 忘记密码重置
* [ ] POST /api/auth/logout - 用户登出
* [ ] GET /api/auth/me - 获取当前用户信息

## Technical Approach

* 参考 YJL 项目 auth.ts 实现
* 验证码存储在 k.cache（5分钟有效期）
* 短信发送使用 k.sms.aliSMS.send()
* 邮箱发送使用 SMTP
* 密码使用 MD5 加密存储
* JWT Token + Cookie 管理会话
* 支持 MOCK_SEND 环境变量控制是否真实发送

## Out of Scope

* Kooboo SSO 接入（后期）
* 密码找回功能
