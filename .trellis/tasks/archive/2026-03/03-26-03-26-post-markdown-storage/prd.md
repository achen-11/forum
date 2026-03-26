# brainstorm: 帖子 Markdown 源码存储

## Goal

解决帖子编辑时无法还原原始 Markdown 格式的问题。当前只存储了 HTML 富文本，编辑时只能获取纯文本（无格式）。

## What I already know

### 当前实现
1. **发帖流程** (`CreatePostDrawer.tsx:164`):
   - 用户在 SplitEditor 编写 Markdown
   - 提交时 `marked(content)` 将 Markdown 转 HTML
   - HTML 存储到 `Forum_Post.content`

2. **编辑流程** (`CreatePostDrawer.tsx:55`):
   - `setContent(initialData.content?.replace(/<[^>]*>/g, '') || '')`
   - 简单 strip 所有 HTML 标签
   - 结果：纯文本，**所有 Markdown 格式丢失**（粗体、斜体、代码块等）

3. **数据库模型** (`Forum_Post.ts`):
   - 只有 `content: String` 字段
   - 无 `markdownContent` 或 `originalContent` 字段

### 问题本质
- Markdown → HTML 是**有损转换**
- HTML 无法还原回结构化的 Markdown
- 必须**同时存储**原始 Markdown 才能支持编辑还原

## Assumptions (temporary)

- 用户期望编辑时保持原来的 Markdown 格式
- 历史帖子可以不做迁移（旧的 HTML-only 帖子继续用 strip 方式）
- 新的帖子需要同时存储 Markdown 和 HTML

## Decision (ADR-lite)

**Context**: 需要在编辑时还原原始 Markdown 格式
**Decision**: 双字段方案 - `content` 存 HTML 用于展示，`markdownContent` 存原始 Markdown 用于编辑还原
**Consequences**: 数据有轻微冗余，但实现简单、向后兼容好

## Open Questions

- (无) 所有历史帖子可清空，无需兼容

## Requirements

- [ ] `Forum_Post` 新增 `markdownContent` 字段
- [ ] 创建帖子时：`markdownContent` = 原始 markdown，`content` = `marked()` 渲染后的 HTML
- [ ] 编辑帖子时：使用 `markdownContent` 而非 strip HTML
- [ ] 获取帖子详情时同时返回 `content`（HTML）和 `markdownContent`（Markdown）

## Acceptance Criteria

- [ ] 发帖后，`content` 是 HTML，`markdownContent` 是原始 Markdown
- [ ] 编辑帖子时，编辑器还原原始 Markdown（格式完整保留）
- [ ] 帖子详情 API 返回两个字段

## Definition of Done (team quality bar)

- 代码改动通过 lint
- 手动测试发帖/编辑流程正常
- 向后兼容已验证

## Out of Scope (explicit)

- 评论/回复的 Markdown 存储（暂只处理帖子）
- 历史数据迁移脚本

## Technical Notes

### 相关文件
- Model: `src/code/Models/Forum_Post.ts` - 需要新增字段
- API: `src/api/forum/post.ts` - create/edit 接口
- Service: `src/code/Services/ForumPostService.ts` - createPost/editPost
- Frontend: `Frontend/src/components/CreatePostDrawer.tsx` - 编辑时获取 markdown
- Frontend: `Frontend/src/components/SplitEditor.tsx` - 编辑器

### 方案选项（待讨论）
1. **双字段方案**: `content` (HTML) + `markdownContent` (原始 Markdown)
2. **纯 Markdown 方案**: 只存 Markdown，前端负责渲染（需评估前端渲染一致性）
3. **混合字段**: `content` 存 Markdown，用标记区分是否已渲染
