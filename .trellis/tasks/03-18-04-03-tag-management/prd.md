# 标签管理 - 标签 CRUD、颜色管理

## Goal

实现标签管理功能：标签增删改查、颜色管理

## Requirements

### 1. 标签 CRUD
- [ ] 后端：标签创建 API（含颜色）
- [ ] 后端：标签更新 API（含名称、颜色）
- [ ] 后端：标签删除 API（软删除，需检查帖子关联）
- [ ] 后端：标签列表 API

### 2. 前端
- [ ] 标签列表页面（显示所有标签及颜色）
- [ ] 创建/编辑标签表单（颜色选择器）
- [ ] 删除确认

### 3. 约束
- [ ] 标签名称唯一性校验
- [ ] 删除时检查是否有帖子关联

## Technical Notes

### 需要新增的 API
- `GET /api/forum/admin/tag/list` - 标签列表
- `POST /api/forum/admin/tag/create` - 创建标签
- `POST /api/forum/admin/tag/update` - 更新标签
- `POST /api/forum/admin/tag/delete` - 删除标签

### 相关文件
- `Forum_Tag` 模型已有 `name, color, usageCount` 字段

## Out of Scope

- 批量操作
- 操作日志
