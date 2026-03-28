# brainstorm: profile 绑定邮箱和手机

## Goal

为论坛用户 Profile 新增**绑定邮箱**和**绑定手机**功能，允许用户将邮箱/手机关联到自己的账号。

## What I already know

### 代码结构
- **Forum_User 模型** (`src/code/Models/Forum_User.ts`)
  - 已有 `email` 和 `phone` 字段 (`unique: true`, `index: true`)
  - 当前 `updateProfile` 只允许更新 `displayName` 和 `avatar`

- **认证服务** (`src/code/Services/auth.ts`)
  - `sendVerificationCode()` - 支持 `codeType`: `login` | `register` | `forgot`
  - `verifyVerificationCode()` - 验证验证码
  - 验证码缓存 key 格式: `forum_verify_code_{type}_{account}`

- **API 路由** (`src/api/forum/auth.ts`)
  - 现有 `/api/forum/auth/{action}` 模式
  - 使用 `successResponse()` / `failResponse()` 封装

### 已有验证基础设施
- 手机号验证: `isPhone()` - `/^1[3-9]\d{9}$/`
- 邮箱验证: `isEmail()` - `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- 验证码 TTL: 300秒 (5分钟)
- 发送频率限制: 60秒内只能发送一次
- 真实发送: 短信 (`k.sms.aliSMS.send`) / 邮件 (`k.mail.smtp.send`)

## Assumptions (temporary)

- 绑定时需要验证码验证（复用现有基础设施）
- 用户只能绑定自己的邮箱/手机（需登录状态）
- 一个邮箱/手机只能被一个账号绑定（字段 unique 约束）

## Decision (ADR-lite)

**Context**: 绑定操作的安全性和灵活性平衡
**Decision**:
- 不需要密码二次验证，依赖登录态
- 验证码 + 查重验证
- 支持更换已绑定联系方式（需先验证旧的）
- 更换流程分开 API 调用（验证旧的 → 发送新的验证码 → 绑定新的）
**Consequences**: 更清晰的流程，更好的安全性，用户操作步骤稍多

## Requirements (confirmed)

### 核心功能
- [ ] 用户可以绑定邮箱到账号（首次绑定）
- [ ] 用户可以绑定手机到账号（首次绑定）
- [ ] 用户可以更换已绑定的邮箱（验证旧的 → 绑定新的）
- [ ] 用户可以更换已绑定的手机（验证旧的 → 绑定新的）
- [ ] 绑定过程需要验证码确认
- [ ] 已绑定的邮箱/手机不可重复绑定到其他账号

### 验证码发送
- [ ] 发送验证码到新邮箱/手机（`codeType: 'bind'`）
- [ ] 发送验证码到旧邮箱/手机（用于验证是否为本人操作）

### 失败/边界情况处理
- [ ] 新邮箱已被他人绑定 → 返回明确错误
- [ ] 新手机已被他人绑定 → 返回明确错误
- [ ] 验证码错误/过期 → 返回明确错误
- [ ] 未登录用户操作 → 返回 "请先登录"
- [ ] 旧邮箱/手机未绑定 → 返回明确错误（更换时才验证旧的）

## Acceptance Criteria

- [ ] 用户绑定邮箱后，`email` 字段被填充且 `unique` 约束生效
- [ ] 用户绑定手机后，`phone` 字段被填充且 `unique` 约束生效
- [ ] 更换邮箱流程：验证旧邮箱 → 发送新邮箱验证码 → 绑定新邮箱
- [ ] 更换手机流程：验证旧手机 → 发送新手机验证码 → 绑定新手机
- [ ] 验证码发送和验证流程正常工作
- [ ] 所有错误场景返回明确错误信息

## Definition of Done (team quality bar)

- [ ] Service 层函数编写，参数校验完整
- [ ] API 路由添加，错误处理完善
- [ ] 复用现有 `sendVerificationCode`，新增 `codeType: 'bind'`
- [ ] Lint / typecheck 通过

## Out of Scope (explicit)

- 解绑功能（不在 MVP 中）
- 第三方账号绑定（Kooboo 等）- 后续扩展
- 强制绑定逻辑

## Technical Notes

### 需新增的 Service 函数
```typescript
// src/code/Services/auth.ts

// 绑定（首次绑定）
bindEmail(email: string, verificationCode: string): void
bindPhone(phone: string, verificationCode: string): void

// 更换（需先验证旧的）
replaceEmail(oldEmail: string, oldCode: string, newEmail: string, newCode: string): void
replacePhone(oldPhone: string, oldCode: string, newPhone: string, newPhone: string): void
```

### 需新增的 API 路由
```
// 绑定
POST /api/forum/auth/bind-email      { email, verificationCode }
POST /api/forum/auth/bind-phone      { phone, verificationCode }

// 更换
POST /api/forum/auth/replace-email    { oldEmail, oldCode, newEmail, newCode }
POST /api/forum/auth/replace-phone    { oldPhone, oldCode, newPhone, newCode }

// 发送验证码（复用现有，增加 codeType: 'bind'）
POST /api/forum/auth/send-bind-code  { account, accountType, codeType: 'bind' }
```

### 需修改的现有函数
- `sendVerificationCode`: 新增 `codeType: 'bind'`，用于绑定时发送验证码
