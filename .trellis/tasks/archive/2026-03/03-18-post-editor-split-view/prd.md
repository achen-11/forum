# 发帖页面增强 - 底部抽屉 + 分屏编辑器

## Goal

将发帖功能从独立页面改为首页底部抽屉，集成源码/预览分屏编辑器，提供更好的 Markdown 编辑体验。

## Requirements

### 1. 首页发帖入口
- 首页添加"发帖"按钮（位置待定，如导航栏或悬浮按钮）
- 点击按钮唤起底部抽屉

### 2. 底部抽屉组件
- 使用 shadcn UI 的 Dialog 或 Drawer 组件
- 抽屉从底部弹出，占屏幕 70-80% 高度
- 支持展开（全屏）按钮
- 支持关闭按钮

### 3. 抽屉内布局（紧凑排列）
- 顶部：社区准则提示条（可选）
- 标题行：标题输入框 + 分类下拉 + 标签选择（紧凑横排）
- 中间：分屏编辑器（固定左侧源码 + 右侧预览，50/50 比例）
- 底部：工具栏 + 发布/取消按钮

### 4. 分屏编辑器
- 左侧：源码编辑区（textarea）
- 右侧：实时预览区（ReactMarkdown 渲染）
- 固定分屏，无需切换模式
- 可拖动分隔线调节比例（20%-80%）

### 5. 工具栏
- 使用 shadcn Button 组件
- 图标按钮：粗体(B)、斜体(I)、标题(TT)、链接、引用(>)、代码块(</>)、图片上传、列表、序号列表
- 点击按钮插入对应 Markdown 语法

### 6. 粘贴功能
- 粘贴图片：自动上传并插入 Markdown 图片语法
- 粘贴文本：智能检测 Markdown 格式，保持原样

### 7. 数据提交
- 标题、分类、标签、内容
- 提交时 Markdown 转换为 HTML

## Acceptance Criteria

- [x] 首页有点击发帖按钮
- [x] 点击发帖按钮唤起底部抽屉
- [x] 抽屉支持展开（全屏）和关闭
- [x] 标题/分类/标签紧凑排列在一行或两行
- [x] 编辑器固定分屏（左侧源码 + 右侧预览）
- [x] 可以拖动分隔线调节比例
- [x] 工具栏按钮可点击，插入对应 Markdown 语法
- [x] 粘贴图片功能正常
- [x] 预览区实时显示渲染效果
- [x] 发布功能正常工作

## Technical Notes

- 使用 shadcn UI 的 Dialog 或 Drawer 组件
- 使用 shadcn Button 组件构建工具栏
- 保留 SplitEditor 组件逻辑
- 已移除 CreatePostPage.tsx 和 /post/new 路由
- 帖子详情页使用 ReplyDrawer 组件进行回复

## 实现内容

### 新增组件
- `components/ui/drawer.tsx` - shadcn 风格底部抽屉组件
- `components/ui/select.tsx` - shadcn 下拉选择组件
- `components/SplitEditor.tsx` - 分屏编辑器组件
- `components/CreatePostDrawer.tsx` - 发帖抽屉组件
- `components/ReplyDrawer.tsx` - 回复抽屉组件

### 修改文件
- `pages/HomePage.tsx` - 添加发帖按钮，唤起抽屉
- `pages/PostDetailPage.tsx` - 添加回复按钮，唤起回复抽屉
- `App.tsx` - 移除 /post/new 路由

### 新增依赖
- @uiw/react-md-editor
- react-markdown
- remark-gfm
- rehype-highlight
- marked
- highlight.js
