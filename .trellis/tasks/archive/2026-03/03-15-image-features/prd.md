# brainstorm: 图片功能完善

## Goal

完善论坛应用的图片相关功能：
1. 修复帖子发布时上传图片文件后缀不正确的问题（当前保存为 "file" 后缀）
2. 将用户资料编辑中的头像输入框改为图片上传组件

## What I already know

### 问题1：图片上传后缀问题
- 后端 API 位置：`src/api/forum/post.ts` 第 310-342 行
- 上传场景：截图工具复制到剪贴板的图片，粘贴到输入框
- 问题原因：`file.name` 可能为空或无扩展名，但 `file.contentType` 有正确的 MIME 类型
- 解决方案：根据 `file.contentType` 映射到正确的文件扩展名

### 问题2：头像上传问题
- 前端页面：`Frontend/src/pages/ProfilePage.tsx`
- 当前使用 `<Input>` 输入框让用户手动输入头像 URL
- 用户选择：点击按钮弹出文件选择器，上传后预览

## Requirements

- [ ] 修复图片上传后缀问题 - 使用 contentType 映射扩展名
- [ ] 用户资料编辑页面支持头像图片上传（点击按钮选择文件）

## Acceptance Criteria

- [ ] 上传截图粘贴的图片时，文件扩展名根据 contentType 正确保存（image/png → .png, image/jpeg → .jpg 等）
- [ ] 用户编辑资料时可以通过点击按钮选择本地图片文件上传
- [ ] 上传成功后实时显示头像预览
- [ ] 保留原有的 URL 输入方式作为备选

## Out of Scope

- 其他类型的文件上传
- 图片裁剪/压缩功能

## Technical Notes

- 复用现有上传 API：`/api/forum/post/upload/image`
- contentType 到扩展名映射：
  - image/jpeg → jpg
  - image/png → png
  - image/gif → gif
  - image/webp → webp
