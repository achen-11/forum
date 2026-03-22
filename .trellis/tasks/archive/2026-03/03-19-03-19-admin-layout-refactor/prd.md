# brainstorm: 后台布局重构(dashboard-01)

## Goal

重构 forum-admin 后台管理界面：
1. 参照 shadcn dashboard-01 的布局风格（Sidebar + Header + Content Area）
2. 将 CRUD 列表组件从卡片式改为 shadcn Table 组件
3. 保持功能不变，提升 UI 一致性和专业性

## What I already know

### Dashboard-01 布局结构
- **Sidebar**: 左侧可折叠侧边栏，包含导航菜单、文档区域、用户信息
- **Header**: 顶部栏，包含 SidebarTrigger、面包屑、快捷操作
- **Content**: 右侧内容区，带有 SectionCards 统计卡片示例

### 现有 Admin 页面（5个）
| 页面 | 路由 | 当前样式 | 主要操作 |
|------|------|----------|----------|
| AdminContentPage | /admin/content | 卡片列表 | 删除、置顶/取消置顶 |
| AdminCategoryPage | /admin/category | 卡片列表 | 创建、编辑、删除 |
| AdminTagPage | /admin/tag | 网格布局 | 创建、编辑、删除 |
| AdminUserPage | /admin/user | 卡片列表 | 搜索、封禁/解封、变更角色 |
| AdminLogPage | /admin/log | 卡片列表 | 筛选（操作类型、对象类型） |

### 现有 AdminLayout
- 使用 shadcn Sidebar 组件（SidebarProvider）
- 顶部有 SidebarTrigger + 预留标题区
- 内容区 Outlet 渲染子页面

### Dashboard-01 新增组件
- `AppSidebar` - 完整侧边栏（带 navMain/navSecondary/navUser）
- `SiteHeader` - 顶部导航头
- `SectionCards` - 统计卡片组件（4列网格）
- `DataTable` - 完整表格组件（带排序、筛选、分页、拖拽）
- `@tabler/icons-react` 图标库

### 技术约束
- Vue 3 + Vite + TypeScript + TailwindCSS
- shadcn/ui (new-york style)
- @tanstack/react-table (DataTable 依赖)
- @dnd-kit (拖拽功能)

## Open Questions

~~1. **首页仪表盘**: 是否需要添加 Dashboard 首页（展示统计概览）？还是保持直接进入内容管理？~~ → **已确认：新增 Dashboard 首页 + 左侧菜单保留原有5项**
~~2. **表格复杂度**: DataTable 支持排序/筛选/分页/拖拽，当前页面是否需要全部功能？~~ → **已确认：基础 Table + 排序 + 筛选，不用批量操作**
~~3. **分页方式**: 现有自定义按钮 vs Table 内置分页~~ → **已确认：Table 内置分页**

## Requirements

### Layout 重构
- [ ] 新增 Dashboard 首页（使用 SectionCards 风格，展示统计数据）
- [ ] 参照 dashboard-01 优化 AdminLayout（Header + Sidebar 样式）
- [ ] 整合 AppSidebar 和 SiteHeader 到现有 AdminLayout
- [ ] 统一侧边栏菜单样式（保留现有 5 个导航项，内容管理改为"概览"仪表盘）

### CRUD Table 化（基础 Table + 排序 + 筛选 + 内置分页）
- [ ] AdminContentPage: 卡片列表 → Table（标题、作者、分类、发布时间、浏览/回复/点赞、操作）
- [ ] AdminCategoryPage: 卡片列表 → Table（名称、描述、排序、首页显示、创建时间、操作）
- [ ] AdminTagPage: 网格布局 → Table（名称、颜色、使用次数、操作）
- [ ] AdminUserPage: 卡片列表 → Table（用户信息、角色、状态、注册/登录时间、操作）
- [ ] AdminLogPage: 卡片列表 → Table（操作类型、对象、操作者、时间、明细）

### 保持不变
- 所有 API 调用逻辑
- 所有业务逻辑（删除、置顶、封禁、变更角色等）
- Dialog/ConfirmDialog 交互
- 筛选/搜索逻辑

## Acceptance Criteria

- [ ] 侧边栏布局与 dashboard-01 风格一致
- [ ] 所有列表页使用 shadcn Table 组件
- [ ] 功能行为与重构前完全一致
- [ ] 响应式布局正常

## Out of Scope

- 新增数据分析/图表功能
- 批量操作功能
- 拖拽排序功能（除非 MVP 需要）

## Technical Notes

### 需要安装的依赖
- @tabler/icons-react (dashboard-01 使用)
- @tanstack/react-table (已有 data-table.tsx)
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (data-table 拖拽)

### 组件映射
- `AppSidebar` → 重构 `AdminSidebar`
- `SiteHeader` → 重构到 `AdminLayout` Header
- `SectionCards` → 用于 Dashboard 首页统计卡片
- `DataTable` → 参考其表格结构，不是直接使用（Vue 版本不同）

## Implementation Plan

**PR1: 布局基础设施**
- 重构 AdminLayout（参照 dashboard-01 风格）
- 更新 Sidebar 和 Header 样式
- 新增 Dashboard 首页（SectionCards 风格统计）

**PR2: Table 组件化**
- 创建 AdminTable 组件（排序、筛选、分页）
- 重构 AdminContentPage → Table

**PR3: 剩余页面 Table 化**
- AdminCategoryPage → Table
- AdminTagPage → Table
- AdminUserPage → Table
- AdminLogPage → Table
