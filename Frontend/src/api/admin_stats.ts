import { adminContentApi } from './admin_content'
import { adminCategoryApi } from './admin_category'
import { adminTagApi } from './admin_tag'
import { adminUserApi } from './admin_user'

export interface DashboardStats {
  postCount: number
  userCount: number
  categoryCount: number
  tagCount: number
}

/**
 * 获取仪表盘统计数据
 * 通过调用各模块的列表API获取总数
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [postsRes, categoriesRes, tagsRes, usersRes] = await Promise.all([
    adminContentApi.getPostList({ page: 1, pageSize: 1 }).catch(() => ({ pagination: { total: 0 } })),
    adminCategoryApi.getCategoryList().catch(() => ({ list: [] })),
    adminTagApi.getTagList().catch(() => ({ list: [] })),
    adminUserApi.getUserList({ page: 1, pageSize: 1 }).catch(() => ({ pagination: { total: 0 } })),
  ])

  return {
    postCount: postsRes.pagination?.total ?? 0,
    userCount: usersRes.pagination?.total ?? 0,
    categoryCount: categoriesRes.list?.length ?? 0,
    tagCount: tagsRes.list?.length ?? 0,
  }
}
