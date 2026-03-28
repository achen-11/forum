# Kooboo 登录接入

## 目标

将 Kooboo 用户系统与论坛用户系统绑定，实现通过 Kooboo 账号登录论坛。

## 用户需求确认

| 问题 | 决策 |
|------|------|
| Q1 用户映射 | A - 自动创建，创建时如果 Kooboo 用户有 phone/email，一并填入 |
| Q2 登录入口 | A - 登录页新增按钮，跳转 `/_Admin/login` |
| Q3 绑定管理 | A - 个人中心提供绑定/解绑 Kooboo 功能；绑定前需查重（该 koobooId 是否已绑定其他用户）|
| Q4 登出行为 | 论坛登出不影响 Kooboo；但有 koobooId 时调用 `k.account.user.logout()` |
| Q5 状态同步 | 不同步，以站点自己的 token 为判断依据 |

## 业务流程

### 登录流程
```
用户点击"Kooboo登录"
    → 跳转到 /_Admin/login?return_url=/forum/callback
    → 用户在 Kooboo 登录页输入账号密码
    → Kooboo 登录成功后跳转回 /forum/callback?koobooLogin=1
    → 前端检测到参数，调用后端 /api/forum/auth/kooboo-login
    → 后端检查 k.account.isLogin，获取 k.account.user.current
    → 查找是否有 Forum_User.koobooId === userName
        → 有：直接发行 token，返回登录成功
        → 无：根据 Kooboo 用户信息自动创建 Forum_User（userName=kooboo_{userName}），发行 token
    → 前端存储 token，跳转到首页
```

### 绑定流程
```
用户进入个人中心 → 点击"绑定Kooboo"
    → 跳转 /_Admin/login?return_url=/forum/callback?bind=1
    → Kooboo 登录成功后跳转回 /forum/callback?bind=1
    → 前端检测到参数，调用后端 /api/forum/auth/kooboo-bind-check
        → 后端检查：
            1. 当前 k.account.isLogin
            2. 该 koobooId 是否已被其他用户绑定
                → 已绑定：返回错误"该Kooboo账号已绑定其他用户"
                → 未绑定：绑定到当前用户，发行 token
    → 前端跳转回个人中心，显示绑定成功
```

### 登出流程
```
用户点击"退出登录"
    → 调用后端 /api/forum/auth/logout
    → 后端检查用户是否有 koobooId
        → 有：调用 k.account.user.logout()
        → 无：不操作
    → 删除论坛 cookie/token
    → 返回成功
```

## 技术实现

### 后端改动

#### 1. 新增 API: `POST /api/forum/auth/kooboo-login`
- 检查 `k.account.isLogin`，未登录则报错
- 获取 `k.account.user.current.userName` 作为 koobooId
- 查找 `Forum_User.findOne({ koobooId })`
  - **已存在**：更新 `lastLoginAt`，发行 token，返回用户信息
  - **不存在**：自动创建用户，userName=`kooboo_{userName}`，填入 Kooboo 用户的 phone/email（如有），发行 token
- Kooboo 用户信息获取方式待确认（是否通过 `k.account.user.current` 获取 phone/email）

#### 2. 新增 API: `GET /api/forum/auth/kooboo-bind-check`
- 需登录（带 Bearer Token）
- 检查 `k.account.isLogin`，未登录则报错
- 获取 `k.account.user.current.userName`
- 检查该 koobooId 是否已被其他用户绑定（`koobooId` 相同且 `_id` 不同）
  - **已绑定**：返回错误
  - **未绑定**：更新当前用户的 `koobooId`，发行新 token
- 返回绑定结果

#### 3. 修改 API: `POST /api/forum/auth/logout`
- 获取当前用户（通过 token）
- 检查 `user.koobooId` 是否存在
  - 存在：调用 `k.account.user.logout()`
- 删除论坛 cookie/token

#### 4. 修改 getCurrentUser()
- 返回数据中增加 `koobooId` 字段

#### 5. 修复 auth.ts 第 31 行遗留代码

### 前端改动

#### 1. 登录页添加 Kooboo 登录按钮
- 位置：现有登录按钮旁边
- 点击跳转：`/_Admin/login?return_url={encodeURIComponent(currentUrl)}`

#### 2. 新增回调页面处理 `/forum/callback`
- 检测 URL 参数：
  - `?koobooLogin=1`：调用 `/api/forum/auth/kooboo-login`，成功后跳转首页
  - `?bind=1`：调用 `/api/forum/auth/kooboo-bind-check`，成功后跳转个人中心
- 错误处理：显示错误信息，提供返回登录页链接

#### 3. 个人中心添加"绑定Kooboo"按钮
- 位置：个人资料设置区域
- 已绑定时显示"已绑定: {koobooId}" + 解绑按钮
- 未绑定时显示"绑定Kooboo"按钮

## Kooboo API 探索

需要确认的问题：
1. `k.account.user.current` 包含哪些字段？是否有 `phone`、`email`？
2. `k.account.user.logout()` 是否存在/有效？

## 任务拆分

### Phase 1: 后端核心
- [ ] 修复 auth.ts 第 31 行遗留代码
- [ ] 实现 `kooboo-login` API
- [ ] 实现 `kooboo-bind-check` API
- [ ] 修改 `logout` API 支持 kooboo登出
- [ ] 修改 `getCurrentUser` 返回 koobooId

### Phase 2: 前端核心
- [ ] 登录页添加 Kooboo 登录按钮
- [ ] 实现 callback 页面处理逻辑
- [ ] 个人中心添加绑定/解绑 UI

### Phase 3: 测试
- [ ] 测试 Kooboo 用户首次登录（自动创建）
- [ ] 测试 Kooboo 用户重复登录（直接返回）
- [ ] 测试绑定已有 Kooboo 到论坛账号
- [ ] 测试解绑
- [ ] 测试登出（kooboo logout）

## 待确认

1. 如何获取 Kooboo 用户的 phone 和 email？`k.account.user.current` 是否有这些字段？
2. `k.account.user.logout()` 是否可用？
