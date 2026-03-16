# Task: 搜索功能

## Goal

实现论坛帖子搜索功能，支持按标题和内容模糊搜索

## Requirements

- [ ] 后端支持搜索帖子 API
- [ ] 支持按关键词搜索（标题、内容模糊匹配）
- [ ] 支持按分类筛选
- [ ] 返回分页结果
- [ ] 返回结果包含帖子信息、作者信息、分类信息
- [ ] 按相关度/时间排序

## Acceptance Criteria

- [ ] API `/api/search` 正常返回搜索结果
- [ ] 支持关键词参数 `keyword`
- [ ] 支持分类筛选参数 `categoryId`（可选）
- [ ] 支持分页参数 `page`, `pageSize`
- [ ] 返回结果包含帖子完整信息、作者信息、分类信息

## Technical Approach

使用原生 SQL 实现复杂搜索查询：
- 使用 LIKE 进行模糊匹配
- 使用 UNION 合并标题和内容匹配结果
- 使用 Dedupe 去除重复
- 支持按相关度（匹配次数）和创建时间排序

## Out of Scope

- 搜索历史记录
- 搜索建议/自动补全
- 全文索引优化（后续迭代）

## Technical Notes

### 涉及文件

- Model: `src/code/Models/Forum_Post.ts`（已有）
- Service: `src/code/Services/ForumPostService.ts`（已有，添加搜索方法）
- API: 新建 `src/api/search.ts`

### 数据库表

- Forum_Post: 帖子表
- Forum_User: 用户表（关联查询）
- Forum_Category: 分类表（关联查询）
