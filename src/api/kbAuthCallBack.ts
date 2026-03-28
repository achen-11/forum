// @k-url /__kbAuthCallback

import { koobooLogin, koobooBindCheck } from "code/Services/auth";

/**
 * 从 token 获取当前用户（不依赖 authService）
 */
function getCurrentUserFromToken() {
  let token: string | undefined = k.request.headers.get?.('Authorization')
  if (!token) token = k.cookie.get?.('forum_auth_token')
  if (!token) return null
  if (token.startsWith('Bearer ')) token = token.slice(7)

  try {
    const decoded = k.security.jwt.decode(token)
    const payload = JSON.parse(decoded)?.value as { userId: string; exp: number } | undefined
    if (!payload?.userId || !payload.exp) return null
    if (Date.now() > payload.exp) return null
    return { _id: payload.userId }
  } catch {
    return null
  }
}
k.api.get(() => {
  const loginType = k.request.get("type")
  const isLogin = k.account.isLogin

  if (isLogin) {
    const koobooUser = k.account.user.current
    if (koobooUser && koobooUser.userName) {
      if (loginType === 'koobooBind') {
        // 绑定模式：需要先检查是否已登录论坛
        const currentUser = getCurrentUserFromToken()
        if (!currentUser) {
          k.response.redirect("/__kbAuthResult?type=bind")
          return
        }
        try {
          koobooBindCheck()
          // 绑定成功
          k.cookie.set("kooboo_result", "bind_success", 1)
          k.response.redirect("/__kbAuthResult?type=bind")
        } catch (e) {
          // 绑定失败，通过 cookie 传递错误信息
          k.cookie.set("kooboo_error", (e as Error)?.message || '绑定失败', 1)
          k.response.redirect("/__kbAuthResult?type=bind")
          return
        }
      } else {
        // 登录模式：自动创建或查找用户并登录
        try {
          koobooLogin()
          // 登录成功，重定向到首页
          k.cookie.set("kooboo_result", "login_success", 1)
          k.response.redirect("/__kbAuthResult?type=login")
        } catch (e) {
          // 登录失败，通过 cookie 传递错误信息
          k.cookie.set("kooboo_error", (e as Error)?.message || '登录失败', 1)
          k.response.redirect("/__kbAuthResult?type=login")
          return
        }
      }
    }
  }
  // 未登录或其他情况，redirect 到首页
  return k.response.redirect("/")

})
