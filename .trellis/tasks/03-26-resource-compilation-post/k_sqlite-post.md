# 🗃️ k_sqlite - 轻量级 SQLite ORM 模块

> Kooboo 平台的 SQLite ORM 库，让数据库操作变得简单。

## 什么是 k_sqlite？

k_sqlite 是一个专为 Kooboo 设计的轻量级 ORM（对象关系映射）库。它让你用 TypeScript 的方式操作 SQLite 数据库，再也不用写繁琐的 SQL 语句。

## 核心特性

| 特性 | 说明 |
|------|------|
| 📦 类型安全 | 通过 TypeScript 类型定义表结构 |
| 🔧 CRUD 封装 | create/find/update/delete 一应俱全 |
| ⏰ 时间戳 | 自动维护 createdAt/updatedAt |
| 🧹 软删除 | 开启后删除只是标记，不会丢数据 |
| 📊 丰富查询 | 分页、排序、聚合应有尽有 |
| 🔀 拖拽排序 | 内置 dragAndDrop 字段支持 |
| 🔄 表结构同步 | diffSchema 对比差异，syncTableSchema 同步 |

## 快速上手

### 定义模型

```typescript
import { define, DataTypes } from 'module:k_sqlite'

const Task = define('tasks', {
  id: {
    type: DataTypes.Number,
    primaryKey: true,
    autoincrement: true,
    initialValue: 10000
  },
  title: {
    type: DataTypes.String,
    required: true
  },
  completed: {
    type: DataTypes.Boolean,
    default: false
  }
}, {
  timestamps: true,    // 自动时间戳
  softDelete: true     // 开启软删除
})
```

### 增删改查

```typescript
// 创建
const id = Task.create({ title: '学习 k_sqlite' })

// 查询
const task = Task.findById(id)
const all = Task.findAll({ completed: false })
const paginated = Task.findPaginated({}, { page: 1, pageSize: 10 })

// 更新
Task.updateById(id, { completed: true })

// 删除（软删除）
Task.removeById(id)
```

## 数据类型

| 类型 | 说明 |
|------|------|
| `DataTypes.String` | 字符串 |
| `DataTypes.Number` | 整数 |
| `DataTypes.Boolean` | 布尔值 |
| `DataTypes.Timestamp` | 时间戳 |
| `DataTypes.Float` | 浮点数 |
| `DataTypes.Array` | 数组（自动 JSON） |
| `DataTypes.Object` | 对象（自动 JSON） |

## 表结构管理

```typescript
// 对比当前表结构和定义的差异
const diff = Task.diffSchema()

// 同步表结构（自动迁移数据）
Task.syncTableSchema()
```

## 资源链接

- 源码位置：`/src/module/k_sqlite/`
- 完整文档：见 `code/index.ts` 内置文档

---

好用记得回来点个赞 👍
