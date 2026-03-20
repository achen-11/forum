# 分类管理 - 分类 CRUD、排序、首页展示控制

## Goal

实现分类管理功能：分类增删改查、排序、首页展示控制

## Requirements

### 1. 分类 CRUD
- [ ] 后端：分类创建 API
- [ ] 后端：分类更新 API（含名称、描述、排序、首页展示）
- [ ] 后端：分类删除 API（软删除）
- [ ] 后端：分类列表 API（支持分页）

### 2. 前端
- [ ] 分类列表页面（显示所有分类及状态）
- [ ] 创建/编辑分类表单
- [ ] 删除确认
- [ ] 排序拖拽（可选）
- [ ] 首页展示开关

### 3. 约束
- [ ] 删除时检查是否有帖子关联
- [ ] 分类名称唯一性校验

## Technical Notes

### 需要新增的 API
- `GET /api/forum/admin/category/list` - 分类列表
- `POST /api/forum/admin/category/create` - 创建分类
- `POST /api/forum/admin/category/update` - 更新分类
- `POST /api/forum/admin/category/delete` - 删除分类

### 相关文件
- `Forum_Category` 模型已有 `name, description, parentId, sortOrder, showOnHome` 字段

## Out of Scope

- 批量操作
- 操作日志
