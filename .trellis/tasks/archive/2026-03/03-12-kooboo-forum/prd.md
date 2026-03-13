# Kooboo 内部论坛开发

## Goal

开发一个 Kooboo 内部论坛系统，用于公司内部沟通交流。分阶段迭代开发。

## What I already know

* 技术栈：React + TailwindCSS + shadcn/ui + Kooboo
* 前端项目已搭建完成（Frontend/）
* Kooboo 后端（api/、code/、module/ 等目录已存在）
* 构建系统已配置：build.sh 自动部署到 src/page、src/css、src/js

## Requirements (evolving)

### Phase 1 - MVP（第一步）
* 用户认证（登录/登出）- 独立用户池
* 帖子列表（首页）
* 帖子详情查看
* 发布帖子（纯文本）
* 回复帖子
* 论坛后台 - 分类管理

### Phase 2 - 完善
* 帖子点赞
* 分类/标签系统
* 用户个人主页
* 帖子搜索

### Phase 3 - 高级功能
* 富文本编辑器
* 附件上传
* 消息通知
* 积分系统

## Open Questions

* ~~用户系统如何对接？（Kooboo 现有用户还是独立用户池？）~~ → **已确认：独立用户池，后期可接入 Kooboo**

## Acceptance Criteria

### Phase 1 页面结构
* 登录页 - /login
* 首页 - / (帖子列表)
* 帖子详情页 - /post/:id
* 后台首页 - /admin (分类管理)

### 功能验收
* [ ] 用户可以注册、登录、登出
* [ ] 首页展示帖子列表
* [ ] 可以查看帖子详情
* [ ] 可以发布新帖子
* [ ] 可以回复帖子
* [ ] 后台可以管理分类

## Definition of Done (team quality bar)

* 前端代码遵循 React + shadcn/ui 规范
* 后端遵循 Kooboo 开发规范
* 构建通过，部署正常

## Decision (ADR-lite)

**Context**: 需要确定用户系统的架构方式
**Decision**: 使用独立用户池，用户名/密码自行管理
**Consequences**: 
- 优点：快速开发，独立性强，不依赖 Kooboo 用户体系
- 后期可接入 Kooboo SSO（单点登录）
- 缺点：需要自行管理用户数据

## Out of Scope (explicit)

* Phase 2、3 功能暂时不开发
* 暂不接入 Kooboo 登录（预留接口）

## Technical Notes

* 前端目录：Frontend/src/
* 后端目录：api/、code/、module/
* 构建产物：src/page/、src/css/、src/js/
