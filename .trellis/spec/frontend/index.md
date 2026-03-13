# 前端开发规范 (Kooboo React)

> 基于 Kooboo 平台的 React 前端开发规范。

---

## 概述

本项目使用 **React + Vite** 开发 Kooboo 前端应用：

- 独立 React 18 + Vite 应用
- 通过 Kooboo API 与后端交互
- 打包后部署到 Kooboo 静态目录

### 技术栈

| 技术 | 说明 |
|------|------|
| React 18 | 前端框架 |
| Vite 7 | 构建工具 |
| Zustand | 状态管理 |
| React Router (Hash) | 路由 |
| TailwindCSS 4 | 样式框架 |
| shadcn/ui | UI 组件库 |

### 项目结构

```
forum/                      # Kooboo 项目根目录
├── Frontend/               # React 前端源码
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   ├── components/     # 公共组件
│   │   ├── api/            # API 封装
│   │   ├── stores/         # Zustand 状态
│   │   ├── types/          # TypeScript 类型
│   │   └── lib/            # 工具函数
│   ├── vite.config.ts
│   └── package.json
├── src/                    # Kooboo 静态资源
│   ├── page/               # 打包后的 HTML
│   ├── css/                # 打包后的样式
│   └── js/                 # 打包后的脚本
├── build.sh                # 构建脚本
└── kooboo.d.ts            # Kooboo 类型定义
```

---

## API 响应格式规范

### 响应格式

后端 API 统一返回以下 JSON 格式：

```typescript
interface ApiResponse<T> {
  code: number      // HTTP 状态码，如 200、400、500
  data: T           // 响应数据
  message: string   // 提示信息，如 'success'、'fail'
}
```

**成功响应**：
```json
{
  "code": 200,
  "data": { ... },
  "message": "success"
}
```

**失败响应**：
```json
{
  "code": 400,
  "data": null,
  "message": "错误信息"
}
```

### 前端 API 层实现

前端 API 使用统一的请求工具 `src/lib/request.ts`（基于 axios）：

```typescript
// src/lib/request.ts
import axios from 'axios'

const request = axios.create({
  baseURL: '/',
  timeout: 10000,
})

// 请求拦截器 - 添加 Token
request.interceptors.request.use((config) => {
  const cookies = document.cookie.split('; ')
  for (const cookie of cookies) {
    if (cookie.startsWith('forum_auth_token=')) {
      const token = cookie.split('=')[1]
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      break
    }
  }
  return config
})

// 响应拦截器 - 统一处理响应格式
request.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data
    if (code !== 200) {
      throw new Error(message || '请求失败')
    }
    return data
  },
  (error) => {
    throw new Error(error.message || '网络错误')
  }
)

export const http = {
  get: <T>(url: string) => request.get<T>(url).then(res => res.data),
  post: <T>(url: string, data?: unknown) => request.post<T>(url, data).then(res => res.data),
  put: <T>(url: string, data?: unknown) => request.put<T>(url, data).then(res => res.data),
  delete: <T>(url: string) => request.delete<T>(url).then(res => res.data),
}
```

**使用示例**：

```typescript
import { http } from '@/lib/request'

// GET 请求
const user = await http.get<User>('/api/user/1')

// POST 请求
const result = await http.post<ApiResult>('/api/login', { userName: 'xxx' })
```

---

## React 性能优化规范

基于 [Vercel React Best Practices](https://github.com/vercel/react-best-practices) 的性能优化指南。

### 优先级规则

| 优先级 | 类别 | 影响 |
|--------|------|------|
| 1 | 消除瀑布流 (Eliminating Waterfalls) | **关键** |
| 2 | 包体积优化 (Bundle Size) | **关键** |
| 3 | 服务端性能 (Server-Side) | 高 |
| 4 | 客户端数据获取 (Client Data Fetching) | 中高 |
| 5 | 重渲染优化 (Re-render) | 中 |
| 6 | 渲染性能 (Rendering) | 中 |
| 7 | JavaScript 性能 | 中低 |
| 8 | 高级模式 (Advanced) | 低 |

### 1. 消除瀑布流 (CRITICAL)

- **async-parallel**: 使用 `Promise.all()` 并行处理独立操作
- **async-api-routes**:尽早启动 Promise，延迟 await

```typescript
// ❌ 瀑布流：串行请求
const user = await fetchUser(id)
const posts = await fetchPosts(user.id)

// ✅ 并行：同时请求
const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(id)
])
```

### 2. 包体积优化 (CRITICAL)

- **bundle-barrel-imports**: 直接导入，避免 barrel 文件
- **bundle-dynamic-imports**: 使用动态导入加载重组件
- **bundle-conditional**: 仅在功能激活时加载模块

```typescript
// ❌  barrel 导入
import { Button, Input, Card } from '@/components/ui'

// ✅ 直接导入
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
```

### 3. 客户端数据获取 (MEDIUM-HIGH)

- **client-swr-dedup**: 使用 SWR 自动去重请求
- **client-localstorage-schema**: 对 localStorage 数据版本控制和最小化

```typescript
// ✅ 使用 SWR 进行数据获取和去重
import useSWR from 'swr'
const { data } = useSWR('/api/user', fetcher)
```

### 4. 重渲染优化 (MEDIUM)

- **rerender-memo**: 将昂贵计算提取到 memoized 组件
- **rerender-derived-state-no-effect**: 在渲染期间派生状态，而非在 effect 中
- **rerender-transitions**: 使用 `startTransition` 处理非紧急更新

```typescript
// ❌ 在 effect 中派生状态
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])

// ✅ 在渲染中派生状态
const fullName = `${firstName} ${lastName}`

// ✅ 使用 startTransition 处理非紧急更新
import { startTransition } from 'react'
startTransition(() => {
  setFilter(query)
})
```

### 5. 渲染性能 (MEDIUM)

- **rendering-content-visibility**: 对长列表使用 content-visibility
- **rendering-conditional-render**: 使用三元运算符，而非 && 条件渲染
- **rendering-hoist-jsx**: 将静态 JSX 提取到组件外部

```typescript
// ❌ 使用 && 条件渲染（可能导致 falsy 值问题）
{show && <Component />}

// ✅ 使用三元运算符
{show ? <Component /> : null}
```

### 6. JavaScript 性能 (LOW-MEDIUM)

- **js-early-exit**: 函数早返回
- **js-set-map-lookups**: 使用 Set/Map 进行 O(1) 查找
- **js-combine-iterations**: 将多个 filter/map 合并为单个循环

```typescript
// ❌ 多次循环
const activeUsers = users.filter(u => u.active)
const activeNames = activeUsers.map(u => u.name)

// ✅ 单次循环
const activeNames = users
  .filter(u => u.active)
  .map(u => u.name)

// 或使用 reduce 一次完成
const activeNames = users.reduce((acc, u) => {
  if (u.active) acc.push(u.name)
  return acc
}, [])
```

---

## 规范索引

| 规范文件 | 说明 |
|----------|------|
| [设计指南](./design-guide.md) | 运动活力风格设计规范 |
| [目录结构](./directory-structure.md) | 项目目录组织规范 |
| [组件规范](./component-guidelines.md) | React 组件开发规范 |
| [状态管理](./state-management.md) | Zustand 状态管理 |
| [类型安全](./type-safety.md) | TypeScript 使用规范 |
| [代码质量](./quality-guidelines.md) | 交付检查清单 |

---

## 重要约束

| 约束 | 说明 |
|------|------|
| React Router | 必须使用 **Hash 模式**（`HashRouter`） |
| 构建命令 | 使用 `./build.sh` |
| 产物位置 | 构建产物自动复制到 `src/page`、`src/css`、`src/js` |
| 首页声明 | `Frontend/index.html` 首行必须有 `<!-- @k-url / -->` |

---

## 规范来源

- [Vercel React Best Practices](https://github.com/vercel/react-best-practices)
- Kooboo 参考文档
- 本项目实践

---

**语言**：本文档使用中文编写。
