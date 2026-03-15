# 个人中心 — 服务端 curl 测试说明

在 Kooboo 服务已启动（如 `pnpm dev` / `kb sync` 后由 Kooboo 运行时提供 API）的前提下，在项目根目录执行以下测试。请将 `BASE_URL` 替换为实际 API 根地址（例如 `http://localhost:端口` 或 Kooboo 部署地址）。

---

## 1. 帖子列表按 authorId 筛选

```bash
# 不带 authorId：返回全部帖子（与原有行为一致）
curl -s "${BASE_URL}/api/forum/post/list" | jq .

# 带 authorId：仅返回该用户发布的帖子（用于个人中心「我的帖子」）
# 将 YOUR_USER_ID 替换为实际用户 _id（可从登录响应或 GET /api/forum/auth/me 获取）
curl -s "${BASE_URL}/api/forum/post/list?authorId=YOUR_USER_ID" | jq .
```

**预期**：`code: 200`，`data.posts` 为数组；带 `authorId` 时仅包含 `authorId` 等于该值的帖子。

---

## 2. 更新当前用户资料（update-profile）

需先登录获取 Cookie（或 Token），再调用更新接口。

```bash
# 2.1 登录获取 Cookie（示例：用户名 + 密码）
curl -s -c cookies.txt -X POST "${BASE_URL}/api/forum/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"account":"testuser1","password":"123456","loginMode":"password"}' | jq .

# 2.2 使用 Cookie 调用更新资料（displayName / avatar）
curl -s -b cookies.txt -X POST "${BASE_URL}/api/forum/auth/update-profile" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"新昵称","avatar":"https://example.com/avatar.png"}' | jq .

# 2.3 未登录调用应返回失败
curl -s -X POST "${BASE_URL}/api/forum/auth/update-profile" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"test"}' | jq .
```

**预期**：
- 2.1：返回 `code: 200`，含 `token`、`userId` 等；Cookie 中有 `forum_auth_token`。
- 2.2：返回 `code: 200`，`data` 为更新后的用户信息（含新 `displayName`、`avatar`）。
- 2.3：返回 `code: 400` 或非 200，且 message 提示需登录或失败原因。

---

## 3. 一键测试脚本示例

```bash
# 设置实际 API 根地址
export BASE_URL="http://localhost:YOUR_PORT"

# 登录并保存 Cookie
curl -s -c cookies.txt -X POST "${BASE_URL}/api/forum/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"account":"testuser1","password":"123456","loginMode":"password"}' > /dev/null

# 获取当前用户（验证 Cookie 有效）
curl -s -b cookies.txt "${BASE_URL}/api/forum/auth/me" | jq .

# 更新资料
curl -s -b cookies.txt -X POST "${BASE_URL}/api/forum/auth/update-profile" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"curl测试昵称"}' | jq .

# 再次获取 me，确认 displayName 已更新
curl -s -b cookies.txt "${BASE_URL}/api/forum/auth/me" | jq .

# 按当前用户 ID 拉帖子列表（将 USER_ID 替换为 me 返回的 _id）
# USER_ID=$(curl -s -b cookies.txt "${BASE_URL}/api/forum/auth/me" | jq -r '.data._id')
# curl -s "${BASE_URL}/api/forum/post/list?authorId=$USER_ID" | jq .
```

---

测试通过后即可进入前端开发（个人中心页、我的帖子、编辑资料、作者跳转等）。

---

## 部署验证执行记录（Verify 阶段）

使用 `KOOBOO_SITE_URL`（或 `BASE_URL`）对远程站点执行 curl 验证，符合 `.trellis/spec/backend/10-workflow/verify.md` 要求。

| 步骤 | 接口 | 结果 |
|------|------|------|
| 1 | GET /api/forum/post/list | 200，data.posts 数组 |
| 2 | GET /api/forum/post/list?authorId=xxx | 200，仅该作者帖子 |
| 3 | POST /api/forum/auth/login | 200，返回 token/userId，Cookie 写入 |
| 4 | GET /api/forum/auth/me（带 Cookie） | 200，当前用户信息 |
| 5 | POST /api/forum/auth/update-profile（带 Cookie） | 200，data 含更新后 displayName、avatar |
| 6 | POST /api/forum/auth/update-profile（无 Cookie） | 400，message「请先登录」 |

**结论**：部署验证 PASS。
