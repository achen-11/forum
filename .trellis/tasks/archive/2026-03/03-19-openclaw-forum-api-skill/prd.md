# OpenClaw Forum API Skill (Brainstorm)

## Goal

为 OpenClaw 提供一个可复用的 forum 操作 skill，让其通过现有论坛 API 安全执行读写动作（查询、发帖、回帖、编辑本人内容），并保证权限边界清晰、调用参数稳定、可审计。

## What I already know

- 用户已确认 v1 选择「读写能力」，并使用专用账号。
- 当前论坛后端已有 API 路由：`/api/forum/post/{action}` 与 `/api/forum/auth/{action}`。
- 已存在可直接复用能力：分类列表、帖子列表、帖子详情、创建帖子、创建回复、编辑帖子、删除帖子/回复、用户详情、登录等。
- 业务层已具备权限判断（普通用户仅可管理本人内容，管理员可管理全部）。

## Requirements

- Skill 必须提供结构化 action 定义，至少覆盖：
  - 读取：`list_categories`、`list_posts`、`get_post_detail`、`list_replies`、`get_user_detail`
  - 写入：`create_post`、`create_reply`、`edit_post`（仅本人）、`delete_post`/`delete_reply`（仅本人）
- Skill 必须以「专用账号」身份工作，不复用普通用户会话。
- 鉴权采用「登录换会话」：先调用 `/api/forum/auth/login`，后续请求复用 cookie/session。
- Skill 对写入动作增加参数约束与输入校验（必填项、长度、空值）。
- Skill 明确错误语义映射（鉴权失败、参数错误、资源不存在、权限不足、服务异常）。
- Skill 文档中必须包含环境变量与最小配置说明。

## Acceptance Criteria

- [ ] SKILL.md 明确描述触发场景、能力边界与不支持项（不含管理/封禁能力）。
- [ ] 列出至少 9 个 action（5 个读取 + 4 个写入），并给出输入/输出字段规范。
- [ ] 每个 action 都有 API 映射（method + path + query/body）与失败处理策略。
- [ ] 明确权限模型：专用账号 + 仅本人可编辑/删除自身内容。
- [ ] 明确会话流程：登录、会话复用、失效重登、退出登录。
- [ ] 文档包含快速调用示例（至少 create_post、create_reply、list_posts 三个示例）。

## Definition of Done

- 完成 skill 目录与 `SKILL.md` 主文档。
- 完成 references（API 映射、错误码约定、配置说明）。
- 完成最小可执行流程说明（如何登录、如何带会话调用写接口）。
- 文档自检通过：能力范围、权限边界、失败语义、示例一致。

## Out of Scope

- 管理员类操作（封禁、置顶、删除他人内容、后台审核）。
- 新增论坛后端数据模型或重构现有路由。
- Webhook 回调或事件订阅。
- 多租户隔离能力。

## Technical Notes

- 已验证关键代码位置：
  - `src/api/forum/post.ts`
  - `src/api/forum/auth.ts`
  - `src/code/Services/ForumPostService.ts`
- 现有写接口依赖登录态；skill 需要定义会话持久化策略（cookie/session token）以复用专用账号身份。
- 现有 `searchPosts` 在服务层存在，但路由层未暴露独立搜索 action；v1 可先不纳入公开 action 或在 skill 中标记为可选扩展。

## Research Notes

### Constraints from current repo

- API 形态为 Kooboo 风格 action 路由（`/api/forum/post/{action}`）。
- 登录接口已提供（`/api/forum/auth/login`），写操作统一检查当前用户登录态。
- 权限逻辑已内建于 service 层，无需在 v1 新增复杂 RBAC。

### Feasible approaches here

**Approach A: Skill 仅编排现有 API（Recommended）**

- How it works:
  - 用 skill 定义动作 -> 直接映射到现有论坛 API
  - 使用专用账号登录并持久化会话
- Pros:
  - 落地快，改动小，风险低
  - 与当前后端保持一致
- Cons:
  - 接口语义受现有 action 粒度限制

**Approach B: 新增中间层 OpenClaw API**

- How it works:
  - 新建一组更语义化接口，再由中间层转调论坛 API
- Pros:
  - 对 OpenClaw 更稳定统一
- Cons:
  - 开发量与维护成本更高，不适合首版

## Decision (ADR-lite)

**Context**: 需要在短时间交付可用 skill，并控制权限风险。  
**Decision**: 采用 Approach A（复用现有论坛 API），使用专用账号驱动读写；鉴权采用登录换会话。  
**Consequences**: 交付速度快、风险低；需处理会话失效重登；后续若 action 粒度不足，再演进中间层。

## Technical Approach

- Skill 目录放在 `.claude/skills/openclaw-forum-api/`。
- 通过 `SKILL.md` 定义：
  - 能力边界（读写，不含管理）
  - 动作规范（输入、输出、失败）
  - 调用工作流（先登录、再业务请求）
- 通过 `references/` 拆分详细内容：
  - `api-map.md`：action 到真实 API 的映射
  - `session-auth.md`：登录会话策略与重试规范
  - `examples.md`：最小调用示例
