# Task: 首页优化

## Goal

根据设计稿重新设计论坛首页，采用深蓝色 (#1111d4) 作为主色调

## 帖子卡片布局（左右两栏）
- 左侧：作者头像
- 右侧：上下布局
  1. 第一行：作者信息 · 发布时间 · 置顶 icon（如有）
  2. 标题
  3. 摘要（description）
  4. 分类/标签展示
  5. 点赞数 / 回复数

## 侧边栏内容（上下布局）
1. **不要** Create Post 按钮（放到右侧 Post List 的筛选 tabs 右侧）
2. Navigation：首页、消息、我的帖子等常用入口
3. 分类 List（分类表新增 "是否在首页展示" 字段）
4. Tags List

## 配色
- 保持 shadcn 黑白色调
- 使用 lucide-react 图标

## 后续任务
- 搜索功能（暂不实现）
- 通知功能（暂不实现，保留 icon 占位）

## Acceptance Criteria

- [ ] 帖子卡片使用左右两栏布局
- [ ] 帖子卡片显示置顶 icon
- [ ] 侧边栏有 Navigation、分类、Tags
- [ ] Create Post 按钮在右侧筛选栏旁边
- [ ] 使用 lucide-react 图标
- [ ] 保持黑白色调
