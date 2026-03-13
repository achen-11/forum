# 论坛数据库表结构设计

## Goal

设计 Kooboo 论坛的数据库表结构，支持 Phase 1 MVP 功能。

## What I already know

* Kooboo 项目结构：src/api/、src/code/、src/module/
* Kooboo 使用 k_sqlite ORM，数据模型存放在 src/code/ 目录
* Kooboo 主键是 `_id`，不需要手动定义 id 字段
* k_sqlite 是同步操作，不需要 await
* 技术栈：React + TailwindCSS + shadcn/ui + Kooboo

## Requirements (MVP 功能)

### 1. 用户表 (Forum_User)
使用 k_sqlite ORM 定义：

```typescript
const Forum_User = ksql.define('Forum_User', {
    userName: {
        type: DataTypes.String,
        required: true,
        unique: true,
        index: true
    },
    displayName: {
        type: DataTypes.String,
        required: true
    },
    password: {
        type: DataTypes.String,
        required: true
    },
    email: {
        type: DataTypes.String,
        unique: true,
        index: true
    },
    phone: {
        type: DataTypes.String,
        unique: true,
        index: true
    },
    avatar: {
        type: DataTypes.String
    },
    role: {
        type: DataTypes.String,
        default: 'user'  // admin/user
    },
    koobooId: {
        type: DataTypes.String,
        comment: '后期接入 Kooboo 登录用'
    },
    lastLoginAt: {
        type: DataTypes.Timestamp
    }
}, {
    timestamps: true,
    softDelete: true
})
```

| 字段                | 类型      | 说明                         |
| ------------------- | --------- | ---------------------------- |
| _id                 | (自动)    | Kooboo 主键                  |
| userName            | String    | 用户名（登录用，唯一）       |
| displayName         | String    | 显示名称（必填）             |
| password            | String    | 密码（加密存储，必填）       |
| email               | String    | 邮箱（唯一，非必填）         |
| phone               | String    | 手机号（唯一，非必填）       |
| avatar              | String    | 头像 URL                     |
| role                | String    | 角色：admin/user，默认 user  |
| koobooId            | String    | Kooboo 用户 ID（后期接入用） |
| lastLoginAt         | Timestamp | 最后登录时间                 |
| isDeleted           | (自动)    | 软删除                       |
| createdAt/updatedAt | (自动)    | 时间戳                       |

### 2. 分类表 (Forum_Category)
支持多级分类：

```typescript
const Forum_Category = ksql.define('Forum_Category', {
    name: {
        type: DataTypes.String,
        required: true
    },
    description: {
        type: DataTypes.String
    },
    parentId: {
        type: DataTypes.String,
        comment: '父分类 ID，空字符串表示顶级分类'
    },
    sortOrder: {
        type: DataTypes.Number,
        default: 0
    }
}, {
    timestamps: true,
    softDelete: true
})
```

| 字段        | 类型   | 说明                   |
| ----------- | ------ | ---------------------- |
| _id         | (自动) | Kooboo 主键            |
| name        | String | 分类名称（必填）       |
| description | String | 分类描述               |
| parentId    | String | 父分类 ID，空=顶级分类 |
| sortOrder   | Number | 排序，数字越小越靠前   |
| isDeleted   | (自动) | 软删除                 |
| createdAt   | (自动) | 创建时间               |

### 3. 帖子表 (Forum_Post)

```typescript
const Forum_Post = ksql.define('Forum_Post', {
    title: {
        type: DataTypes.String,
        required: true
    },
    content: {
        type: DataTypes.String,
        required: true
    },
    authorId: {
        type: DataTypes.String,
        required: true,
        ref: { tableName: 'Forum_User', fieldName: '_id' }
    },
    categoryId: {
        type: DataTypes.String,
        ref: { tableName: 'Forum_Category', fieldName: '_id' }
    },
    viewCount: {
        type: DataTypes.Number,
        default: 0
    },
    replyCount: {
        type: DataTypes.Number,
        default: 0
    },
    isPinned: {
        type: DataTypes.Boolean,
        default: false
    }
}, {
    timestamps: true,
    softDelete: true
})
```

| 字段                | 类型    | 说明                 |
| ------------------- | ------- | -------------------- |
| _id                 | (自动)  | Kooboo 主键          |
| title               | String  | 帖子标题（必填）     |
| content             | String  | 帖子内容（必填）     |
| authorId            | String  | 作者 ID（外键）      |
| categoryId          | String  | 分类 ID（外键）      |
| viewCount           | Number  | 浏览次数，默认 0     |
| replyCount          | Number  | 回复次数，默认 0     |
| isPinned            | Boolean | 是否置顶，默认 false |
| isDeleted           | (自动)  | 软删除               |
| createdAt/updatedAt | (自动)  | 时间戳               |

### 4. 回复表 (Forum_Reply)

```typescript
const Forum_Reply = ksql.define('Forum_Reply', {
    postId: {
        type: DataTypes.String,
        required: true,
        ref: { tableName: 'Forum_Post', fieldName: '_id' }
    },
    parentId: {
        type: DataTypes.String,
        comment: '父回复 ID，空=顶级回复'
    },
    authorId: {
        type: DataTypes.String,
        required: true,
        ref: { tableName: 'Forum_User', fieldName: '_id' }
    },
    content: {
        type: DataTypes.String,
        required: true
    }
}, {
    timestamps: true,
    softDelete: true
})
```

| 字段      | 类型   | 说明                   |
| --------- | ------ | ---------------------- |
| _id       | (自动) | Kooboo 主键            |
| postId    | String | 帖子 ID（外键）        |
| parentId  | String | 父回复 ID，空=顶级回复 |
| authorId  | String | 作者 ID（外键）        |
| content   | String | 回复内容（必填）       |
| isDeleted | (自动) | 软删除                 |
| createdAt | (自动) | 创建时间               |

### 5. 点赞记录表 (Forum_Like)
记录用户点赞帖子或回复：

```typescript
const Forum_Like = ksql.define('Forum_Like', {
    userId: {
        type: DataTypes.String,
        required: true,
        ref: { tableName: 'Forum_User', fieldName: '_id' }
    },
    targetType: {
        type: DataTypes.String,
        required: true,
        comment: 'post=帖子, reply=回复'
    },
    targetId: {
        type: DataTypes.String,
        required: true,
        comment: '被点赞的帖子或回复的 ID'
    }
}, {
    timestamps: true
})
```

| 字段       | 类型   | 说明                 |
| ---------- | ------ | -------------------- |
| _id        | (自动) | Kooboo 主键          |
| userId     | String | 点赞用户 ID（外键）  |
| targetType | String | 点赞类型：post/reply |
| targetId   | String | 被点赞的目标 ID      |
| createdAt  | (自动) | 点赞时间             |

**唯一约束**：(userId, targetType, targetId) 组合唯一，防止重复点赞

---

## Acceptance Criteria

* [ ] 用户表设计完成（含 Kooboo 登录预留字段）
* [ ] 分类表设计完成（支持多级分类）
* [ ] 帖子表设计完成
* [ ] 回复表设计完成
* [ ] 点赞记录表设计完成
* [ ] 表结构符合 Kooboo k_sqlite 规范
