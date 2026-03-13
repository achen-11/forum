import axios, { AxiosRequestConfig } from 'axios'

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 创建 axios 实例
const request = axios.create({
  baseURL: '/',
  timeout: 10000,
})

// 请求拦截器 - 添加 Token
request.interceptors.request.use(
  (config) => {
    // 从 cookie 中读取 token
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
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理响应格式
request.interceptors.response.use(
  (response) => {
    const data = response.data
    // 兼容 Kooboo 可能返回字符串的情况
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        if (parsed.code !== 200) {
          throw new Error(parsed.message || '请求失败')
        }
        return parsed.data
      } catch (e) {
        throw new Error('响应解析失败')
      }
    }
    
    const { code, message } = data
    if (code !== 200) {
      throw new Error(message || '请求失败')
    }
    return data.data
  },
  (error) => {
    // 处理网络错误
    const message = error.response?.data?.message || error.message || '网络错误'
    throw new Error(message)
  }
)

// 封装请求方法
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request.get(url, config) as Promise<T>,

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request.post(url, data, config) as Promise<T>,

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request.put(url, data, config) as Promise<T>,

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request.delete(url, config) as Promise<T>,
}

export default request
