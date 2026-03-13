import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import { MessageCircle, Mail, Phone, Lock, User, ArrowLeft } from 'lucide-react'

type PageMode = 'login' | 'register' | 'forgot'
type LoginMode = 'password' | 'code'
type AccountType = 'username' | 'phone' | 'email'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, register, isLoading, error, clearError } = useAuthStore()

  const [pageMode, setPageMode] = useState<PageMode>('login')
  const [loginMode, setLoginMode] = useState<LoginMode>('password')
  const [accountType, setAccountType] = useState<AccountType>('username')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [codeSending, setCodeSending] = useState(false)
  const [codeCountdown, setCodeCountdown] = useState(0)
  const [resetSuccess, setResetSuccess] = useState(false)

  const isPhoneOrEmail = accountType === 'phone' || accountType === 'email'

  const handleSendCode = useCallback(async () => {
    if (!account || codeCountdown > 0) return
    setCodeSending(true)
    try {
      const codeType = pageMode === 'login' ? 'login' : pageMode === 'register' ? 'register' : 'forgot'
      const res = await authApi.sendCode({
        account,
        accountType: accountType as 'phone' | 'email',
        codeType,
      })
      if (res.code === 200) {
        setCodeCountdown(60)
        const timer = setInterval(() => {
          setCodeCountdown((c) => {
            if (c <= 1) {
              clearInterval(timer)
              return 0
            }
            return c - 1
          })
        }, 1000)
      } else {
        alert(res.message)
      }
    } catch {
      alert('发送失败')
    } finally {
      setCodeSending(false)
    }
  }, [account, accountType, codeCountdown, pageMode])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (pageMode === 'login') {
      const success = await login({
        account,
        password: loginMode === 'password' ? password : undefined,
        verificationCode: loginMode === 'code' ? code : undefined,
        loginMode,
      })
      if (success) {
        navigate('/')
      }
    } else if (pageMode === 'register') {
      // 注册
      if (password !== confirmPassword) {
        alert('两次密码输入不一致')
        return
      }
      const success = await register({
        userName: accountType === 'username' ? account : undefined,
        phone: accountType === 'phone' ? account : undefined,
        email: accountType === 'email' ? account : undefined,
        password,
        verificationCode: accountType !== 'username' ? code : '',
        accountType,
      })
      if (success) {
        navigate('/')
      }
    } else if (pageMode === 'forgot') {
      // 忘记密码
      if (password !== confirmPassword) {
        alert('两次密码输入不一致')
        return
      }
      try {
        const res = await authApi.resetPassword({
          account,
          accountType: accountType as 'phone' | 'email' | 'username',
          newPassword: password,
          verificationCode: code,
        })
        if (res.code === 200) {
          setResetSuccess(true)
          setTimeout(() => {
            setPageMode('login')
            setResetSuccess(false)
          }, 2000)
        } else {
          alert(res.message)
        }
      } catch (err: any) {
        alert(err.message || '重置失败')
      }
    }
  }, [account, password, confirmPassword, code, loginMode, pageMode, login, register, navigate, clearError])

  const togglePageMode = (mode: PageMode) => {
    clearError()
    setPageMode(mode)
    setCode('')
    setCodeCountdown(0)
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-screen flex">
      {/* 左侧视觉区域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full text-white p-12">
          {pageMode === 'forgot' ? (
            <>
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-emerald-500/30">
                <Lock className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-4xl font-bold mb-4 text-white">找回密码</h1>
              <p className="text-slate-400 text-lg max-w-md text-center">
                输入您的账号信息<br />我们将发送验证码帮助您找回
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-emerald-500/30">
                <MessageCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-4xl font-bold mb-4 text-white">
                {pageMode === 'login' ? '欢迎回来' : '加入我们'}
              </h1>
              <p className="text-slate-400 text-lg max-w-md text-center">
                {pageMode === 'login' ? '连接你我，分享见解\n让思想在此碰撞' : '创建账号，开启交流之旅'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            {pageMode === 'forgot' && (
              <button
                onClick={() => togglePageMode('login')}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回登录
              </button>
            )}
            <CardTitle className="text-2xl font-bold text-gray-900">
              {pageMode === 'login' ? '登录' : pageMode === 'register' ? '注册' : '找回密码'}
            </CardTitle>
            <CardDescription>
              {pageMode === 'login' 
                ? (loginMode === 'password' ? '使用账号密码登录' : '使用验证码登录')
                : pageMode === 'register' ? '创建一个新账号' : '重置您的账号密码'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900">密码重置成功！</p>
                <p className="text-sm text-gray-500 mt-1">正在跳转到登录页...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* 忘记密码模式：只显示账号输入 + 验证码 + 新密码 */}
                {pageMode === 'forgot' ? (
                  <>
                    <div className="flex gap-1">
                      {(['phone', 'email'] as AccountType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAccountType(type)}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                            accountType === type
                              ? 'bg-slate-100 text-slate-900'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {type === 'phone' ? '手机号' : '邮箱'}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        {accountType === 'phone' ? '手机号' : '邮箱'}
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {accountType === 'phone' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        </div>
                        <Input
                          type={accountType === 'email' ? 'email' : 'tel'}
                          placeholder={accountType === 'phone' ? '请输入手机号' : '请输入邮箱'}
                          value={account}
                          onChange={(e) => setAccount(e.target.value)}
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">验证码</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <Input
                            type="text"
                            placeholder="请输入验证码"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="pl-10 h-11"
                            required
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendCode}
                          disabled={!account || codeCountdown > 0 || codeSending}
                          className="h-11 px-4 whitespace-nowrap"
                        >
                          {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">新密码</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <Input
                          type="password"
                          placeholder="请输入新密码（至少6位）"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">确认新密码</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <Input
                          type="password"
                          placeholder="请再次输入新密码"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 注册时显示账号类型切换 */}
                    {pageMode === 'register' && (
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setAccountType('username')}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${accountType === 'username'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                          用户名
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccountType('phone')}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${accountType === 'phone'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                          手机号
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccountType('email')}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${accountType === 'email'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                          邮箱
                        </button>
                      </div>
                    )}

                    {/* 登录时显示账号类型切换 */}
                    {pageMode === 'login' && (
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountType('username')
                            setLoginMode('password')
                          }}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${accountType === 'username'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                          用户名
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAccountType('phone')
                            setLoginMode('password')
                          }}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${accountType === 'phone'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                          手机号
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAccountType('email')
                            setLoginMode('password')
                          }}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${accountType === 'email'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                          邮箱
                        </button>
                      </div>
                    )}

                    {/* 登录时显示登录方式切换 - 用户名登录不支持验证码 */}
                    {pageMode === 'login' && accountType !== 'username' && (
                      <div className="flex items-center justify-end text-sm">
                        <button
                          type="button"
                          onClick={() => setLoginMode(loginMode === 'password' ? 'code' : 'password')}
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                          {loginMode === 'password' ? '验证码登录' : '密码登录'}
                        </button>
                      </div>
                    )}

                    {/* 账号输入 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        {accountType === 'username' ? '用户名' : accountType === 'phone' ? '手机号' : '邮箱'}
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {accountType === 'username' ? <User className="w-4 h-4" /> :
                            accountType === 'phone' ? <Phone className="w-4 h-4" /> :
                            <Mail className="w-4 h-4" />}
                        </div>
                        <Input
                          type={accountType === 'email' ? 'email' : accountType === 'phone' ? 'tel' : 'text'}
                          placeholder={
                            accountType === 'username'
                              ? '请输入用户名'
                              : accountType === 'phone'
                              ? '请输入手机号'
                              : '请输入邮箱'
                          }
                          value={account}
                          onChange={(e) => setAccount(e.target.value)}
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>

                    {/* 验证码输入 - 注册时（用户名除外）必填，登录时可选 */}
                    {((pageMode === 'register' && accountType !== 'username') || (pageMode === 'login' && loginMode === 'code' && isPhoneOrEmail)) && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">验证码</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <Lock className="w-4 h-4" />
                            </div>
                            <Input
                              type="text"
                              placeholder="请输入验证码"
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                              className="pl-10 h-11"
                              required
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSendCode}
                            disabled={!account || codeCountdown > 0 || codeSending}
                            className="h-11 px-4 whitespace-nowrap"
                          >
                            {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 密码输入 */}
                    {((pageMode === 'login' && loginMode === 'password') || pageMode === 'register') && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          {pageMode === 'register' ? '设置密码' : '密码'}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <Input
                            type="password"
                            placeholder={pageMode === 'register' ? '请设置密码（至少6位）' : '请输入密码'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-11"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* 确认密码 - 仅注册时 */}
                    {pageMode === 'register' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">确认密码</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <Input
                            type="password"
                            placeholder="请再次输入密码"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 h-11"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 错误提示 */}
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{error}</p>
                )}

                {/* 提交按钮 */}
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading 
                    ? (pageMode === 'login' ? '登录中...' : pageMode === 'register' ? '注册中...' : '处理中...')
                    : (pageMode === 'login' ? '登录' : pageMode === 'register' ? '注册' : '重置密码')
                  }
                </Button>

                {/* 底部切换 */}
                {pageMode !== 'forgot' && (
                  <div className="flex items-center justify-between text-sm">
                    {pageMode === 'login' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => togglePageMode('register')}
                          className="text-slate-900 hover:text-slate-700 font-medium"
                        >
                          立即注册
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePageMode('forgot')}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          忘记密码？
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => togglePageMode('login')}
                        className="text-slate-900 hover:text-slate-700 font-medium"
                      >
                        已有账号？立即登录
                      </button>
                    )}
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
