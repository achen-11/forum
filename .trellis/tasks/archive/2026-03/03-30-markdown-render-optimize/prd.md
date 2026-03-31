# brainstorm: Markdown渲染引擎优化

## Goal

优化站点的 Markdown 渲染效果，提升代码高亮质量和扩展 Markdown 语法功能。

## What I already know

### 当前技术栈
项目使用 React + Vite 的 Kooboo Local Vue 模式，Markdown 渲染依赖：
- `react-markdown: ^10.1.0` - React 组件封装
- `marked: ^17.0.4` - Markdown 解析器（VitePress 使用的是 `markdown-it`）
- `highlight.js` - 代码高亮（VitePress 使用 `Shiki`，VS Code 同款引擎）
- `remark-gfm: ^4.0.1` - GitHub 风格 Markdown 扩展
- `rehype-highlight: ^7.0.2` - rehype 插件

### VitePress 的渲染引擎架构
VitePress 使用的是完全不同的技术栈：

| 组件 | VitePress | 当前项目 |
|------|-----------|----------|
| Markdown 解析器 | `markdown-it` | `marked` |
| 代码高亮引擎 | `Shiki` (VS Code 同款) | `highlight.js` |
| 高亮主题 | 内置多个主题 (github-dark, vscode-dark 等) | `highlight.js/styles/github.css` |
| 扩展方式 | `markdown-it` 插件 | `remark/rehype` 插件 |

VitePress 的核心优势：
1. **Shiki** 高亮质量远超 highlight.js，支持更多主题和 VS Code 同款语法着色
2. **markdown-it** 生态丰富，有大量现成插件
3. 内置**容器语法** (:::info, :::tip, :::warning, :::danger)
4. 内置**行高亮**支持 (` ```js{4}` )
5. 支持**代码块 diff** 语法

### 复用可行性分析

**不能直接拿过来用的原因：**
- VitePress 的 markdown-it 实例在构建时创建，与 Vite 深度耦合
- VitePress 是静态站点生成器，整个渲染发生在服务端/构建时
- 我们的场景是**客户端渲染**（React 组件内实时渲染）

**可以借鉴的方案：**
- 使用 `markdown-it` 替代 `marked`（语法相似，迁移成本低）
- 使用 `shiki` 替代 `highlight.js`（高亮质量显著提升）
- 使用 `markdown-it` 的容器插件实现 VitePress 风格的提示框

## Requirements

1. **代码高亮升级**：使用 `shiki` 替代 `highlight.js`
   - 按需加载：只打包常用语言（js, ts, css, html, json, bash, python, go, rust 等 ~10 种）
   - 使用 `github-dark` 主题（与 VS Code/GitHub 一致）
   - 目标体积：约 200KB

2. **容器语法支持**：添加 `markdown-it-container` 插件
   - 支持 `::: tip`, `::: warning`, `::: danger`, `::: info` 语法
   - 自定义渲染样式（图标 + 颜色）

3. **迁移 `marked` → `markdown-it`**
   - 保持 React 客户端渲染方式
   - 兼容现有 remark-gfm 插件功能

## Acceptance Criteria

- [ ] shiki 按需加载，build 体积增量 < 300KB
- [ ] 代码块使用 shiki 高亮，支持行号
- [ ] `::: tip/warning/danger/info` 容器正常渲染
- [ ] 现有 `react-markdown` 使用处不受影响（帖子内容渲染）
- [ ] SplitEditor 预览区使用新渲染器

## Decision (ADR-lite)

**Context**: 用户需要更好的代码高亮质量和 VitePress 风格的容器语法，同时担心 shiki 打包体积。

**Decision**: 采用 Plan C - 全面升级
- 使用 `shiki` 按需加载控制体积
- 使用 `markdown-it` + `markdown-it-container` 实现容器语法
- 迁移成本可控，保持客户端渲染

**Consequences**:
- 打包体积增加约 200-250KB（可接受）
- 需要新增一个 Markdown 渲染工具函数
- SplitEditor 预览组件需要更新

## Technical Notes

### 关键依赖
- `shiki` - 代码高亮（替代 highlight.js）
- `markdown-it` - Markdown 解析器（替代 marked）
- `markdown-it-container` - 容器插件

### 按需加载配置
只加载以下语言：javascript, typescript, css, html, json, bash, python, go, rust, java, cpp, c

只加载主题：github-dark

### 文件变更
- `Frontend/package.json` - 添加依赖
- `Frontend/src/utils/markdown.ts` - 新建渲染工具函数
- `Frontend/src/components/SplitEditor.tsx` - 使用新渲染器
- 其他使用 `react-markdown` 的地方（可选迁移）

### 参考
- VitePress markdown 扩展：https://vitejs.cn/vitepress/guide/markdown.html
- markdown-it-container 使用：https://blog.csdn.net/gitblog_00179/article/details/141376643
