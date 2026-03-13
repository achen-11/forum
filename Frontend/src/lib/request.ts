import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

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
  <T>(response: AxiosResponse<ApiResponse<T>>) => {
    const { code, data, message } = response.data
    if (code !== 200) {
      throw new Error(message || '请求失败')
    }
    return data
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
    request.get<ApiResponse<T>>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request.post<ApiResponse<T>>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request.put<ApiResponse<T>>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request.delete<ApiResponse<T>>(url, config).then((res) => res.data),
}

export default request
