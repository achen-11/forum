# 个人中心 — 服务端 Plan

## 任务边界

- **目标**：为个人中心功能提供后端能力——按作者获取帖子列表、更新当前用户资料。
- **不改动**：不新增数据表、不修改 Forum_User/Forum_Post 模型结构。

## 影响文件

| 层级 | 文件 | 改动说明 |
|------|------|----------|
| Service | `src/code/Services/ForumPostService.ts` | `getPostList` 增加可选参数 `authorId`，查询时加入 where 条件 |
| Service | `src/code/Services/auth.ts` | 新增 `updateProfile(updates)`：仅更新当前登录用户的 displayName、avatar |
| API | `src/api/forum/post.ts` | `list` 接口读取 query `authorId`，传入 `getPostList` |
| API | `src/api/forum/auth.ts` | 新增 `update-profile` 路由，body 含 displayName、avatar，调用 auth.updateProfile |

## 验收标准

- [ ] `GET /api/forum/post/list?authorId=xxx` 返回该作者发布的帖子列表（结构与现有 list 一致）。
- [ ] `POST /api/forum/auth/update-profile` 请求体为 `{ displayName?: string, avatar?: string }`，仅更新当前登录用户；未登录返回 401/失败。
- [ ] 使用 curl 在本地对上述两接口完成联调验证。

## Model 结论

- 无新增模型。Forum_User 已有 displayName、avatar；Forum_Post 已有 authorId。无需迁移。
