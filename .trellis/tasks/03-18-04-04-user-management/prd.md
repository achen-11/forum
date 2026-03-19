# 用户管理 - 用户列表、角色变更、封禁/解封

## Goal

实现用户管理功能：用户列表、角色变更、封禁/解封

## Requirements

### 1. 用户列表
- [ ] 后端：用户列表 API（支持分页、搜索）
- [ ] 前端：用户列表页面（显示用户名、角色、状态、注册时间）

### 2. 角色变更
- [ ] 后端：变更用户角色 API（普通用户 ↔ 管理员）
- [ ] 前端：角色变更下拉选择
- [ ] 约束：不能将自己的角色降级

### 3. 封禁/解封
- [ ] 后端：封禁用户 API
- [ ] 后端：解封用户 API
- [ ] 前端：封禁/解封按钮
- [ ] 约束：不能封禁自己

### 4. 角色体系
| 角色 | 说明 |
|------|------|
| superadmin | 超级管理员，数据库直接设置，可管理所有用户 |
| admin | 管理员，可被 superadmin 提升 |
| user | 普通用户 |

## Technical Notes

### 需要新增的 API
- `GET /api/forum/admin/user/list` - 用户列表
- `POST /api/forum/admin/user/role` - 变更用户角色
- `POST /api/forum/admin/user/ban` - 封禁用户
- `POST /api/forum/admin/user/unban` - 解封用户

### 相关文件
- `Forum_User` 模型已有 `role` 字段

## Out of Scope

- 批量操作
- 操作日志
- 删除用户
