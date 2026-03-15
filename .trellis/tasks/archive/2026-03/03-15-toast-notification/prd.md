# Task: 将 alert 替换为 shadcn Toast 组件

## Goal

将现有的 `alert()` 调用替换为更友好的 Toast 通知组件

## What I already know

### alert 调用位置
- **ProfilePage.tsx**:
  - 第 64 行: `alert('请上传图片文件')`
  - 第 70 行: `alert('图片大小不能超过 2MB')`
  - 第 82 行: `alert(err instanceof Error ? err.message : '上传失败')`
  - 第 109 行: `alert(err instanceof Error ? err.message : '更新失败')`

- **LoginPage.tsx**:
  - 第 54 行: `alert(message)`
  - 第 77 行: `alert('两次密码输入不一致')`
  - 第 94 行: `alert('两次密码输入不一致')`
  - 第 112 行: `alert(message)`

### shadcn/ui 组件情况
当前项目未安装 Toast 组件，需要：
1. 安装 sonner（shadcn 推荐的 toast 方案）
2. 或使用 shadcn 的 toast 组件

## Requirements

- [ ] 添加 toast 组件依赖（sonner 或 shadcn toast）
- [ ] 创建全局 toast 调用方法
- [ ] 替换 ProfilePage.tsx 中的所有 alert
- [ ] 替换 LoginPage.tsx 中的所有 alert

## Acceptance Criteria

- [ ] 项目可以正常构建
- [ ] 所有 alert 调用都被替换为 toast
- [ ] toast 通知正常显示（成功/错误/警告等不同类型）

## Technical Notes

- 推荐使用 sonner：轻量级、体验好、TypeScript 支持好
- 安装命令：`npm install sonner` 或 `npx shadcn@latest add toast`
