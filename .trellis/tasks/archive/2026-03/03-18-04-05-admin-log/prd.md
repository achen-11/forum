# 操作日志 - 完整追溯，支持筛选和分页

## Goal

实现操作日志功能：记录管理员关键操作，支持完整追溯

## Requirements

### 1. 日志记录
- [ ] 新增 Forum_AdminLog 模型
- [ ] 在所有管理操作时记录日志（帖子删除、置顶、回复删除、分类/标签/用户管理）
- [ ] 记录内容：操作者、时间、操作类型、对象类型、对象ID、变更详情

### 2. 日志查询
- [ ] 后端：日志列表 API（支持按时间、操作者、操作类型、对象类型筛选，支持分页）
- [ ] 前端：日志列表页面（表格展示）

### 3. 日志字段
| 字段 | 说明 |
|------|------|
| operatorId | 操作者用户ID |
| operatorName | 操作者用户名 |
| action | 操作类型（如：POST_DELETE, POST_PIN, USER_BAN） |
| targetType | 对象类型（如：post, reply, category, tag, user） |
| targetId | 对象ID |
| detail | 变更详情（JSON 格式） |
| createdAt | 操作时间 |

## Technical Notes

### 需要新增的模型
```typescript
Forum_AdminLog = {
  operatorId: String,
  operatorName: String,
  action: String,
  targetType: String,
  targetId: String,
  detail: String, // JSON
  createdAt: Timestamp
}
```

### 需要新增的 API
- `GET /api/forum/admin/log/list` - 日志列表（筛选+分页）
- `POST /api/forum/admin/*` - 在各管理操作中插入日志记录

## Out of Scope

- 日志导出
- 日志统计分析
