/**
 * 论坛用户认证服务
 * 支持：密码登录、验证码登录、注册、重置密码等
 */
import { Forum_User } from 'code/Models/Forum_User'
import ENV from 'code/Utils/ENV'

const COOKIE_TOKEN_KEY = 'forum_auth_token'
const COOKIE_MAX_AGE_DAY_REMEMBER = 30
const COOKIE_MAX_AGE_DAY_DEFAULT = 1
const TOKEN_EXPIRE_MS_REMEMBER = 30 * 24 * 60 * 60 * 1000
const TOKEN_EXPIRE_MS_DEFAULT = 24 * 60 * 60 * 1000
const VERIFY_CODE_TTL = 300 // 5 分钟

export interface TokenPayload {
    userId: string
    name: string
    exp: number
}

function isPhone(account: string): boolean {
    return /^1[3-9]\d{9}$/.test(account)
}

function isEmail(account: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)
}

function isUserName(account: string): boolean {
    // 用户名：2-20位字母数字下划线
    return /^[a-zA-Z0-9_]{2,20}$/.test(account)
}

function cacheKey(type: 'phone' | 'email', account: string): string {
    return type === 'email'
        ? `forum_verify_code_email_${account}`
        : `forum_verify_code_phone_${account}`
}

function setTokenCookie(token: string, isRemember: boolean): void {
    const maxAgeDay = isRemember
        ? COOKIE_MAX_AGE_DAY_REMEMBER
        : COOKIE_MAX_AGE_DAY_DEFAULT
    k.response.setHeader('Authorization', `Bearer ${token}`)
    k.cookie.set(COOKIE_TOKEN_KEY, token, maxAgeDay)
}

function issueToken(row: any, isRemember: boolean) {
    const expiresIn = isRemember
        ? TOKEN_EXPIRE_MS_REMEMBER
        : TOKEN_EXPIRE_MS_DEFAULT
    const exp = Date.now() + expiresIn
    const token = k.security.jwt.encode({
        userId: row._id,
        name: row.displayName || row.userName || row.phone || row.email || '',
        exp
    })
    setTokenCookie(token, isRemember)
    return {
        token,
        userId: row._id,
        name: row.displayName || row.userName || row.phone || row.email || '',
        phone: row.phone,
        email: row.email,
        userName: row.userName
    }
}

/**
 * 验证账号类型
 */
function getAccountType(account: string): 'phone' | 'email' | 'username' | null {
    const trimmed = account.trim()
    if (isPhone(trimmed)) return 'phone'
    if (isEmail(trimmed)) return 'email'
    if (isUserName(trimmed)) return 'username'
    return null
}

/**
 * 根据账号查找用户
 */
function findUserByAccount(account: string, accountType: 'phone' | 'email' | 'username') {
    if (accountType === 'phone') {
        return Forum_User.findOne({ phone: account } as any)
    } else if (accountType === 'email') {
        return Forum_User.findOne({ email: account.toLowerCase() } as any)
    } else {
        return Forum_User.findOne({ userName: account } as any)
    }
}

/**
 * 登录：支持密码登录和验证码登录
 */
export function login(body: {
    account: string
    password?: string
    verificationCode?: string
    loginMode: 'password' | 'code'
    isRemember?: boolean
}) {
    const { account, password, verificationCode, loginMode, isRemember = false } = body
    const accountTrim = account.trim()
    const accountType = getAccountType(accountTrim)

    if (!accountTrim) throw new Error('请输入账号')
    if (!accountType) throw new Error('请输入正确的手机号、邮箱或用户名')

    if (loginMode === 'password') {
        // 密码登录
        if (!password?.trim()) throw new Error('请输入密码')
        const md5Password = k.security.md5(password.trim())

        const user = findUserByAccount(accountTrim, accountType) as any
        if (!user || !user._id) throw new Error('账号或密码错误')

        if (user.password !== md5Password) throw new Error('账号或密码错误')

        // 更新最后登录时间
        Forum_User.updateById(user._id, { lastLoginAt: Date.now() } as any)

        return issueToken(user, isRemember)
    }

    if (loginMode === 'code') {
        // 验证码登录
        if (!verificationCode?.trim()) throw new Error('请输入验证码')

        const code = k.cache.get(cacheKey(accountType, accountTrim))
        if (!code || code !== verificationCode.trim()) {
            throw new Error('验证码错误或已过期')
        }

        // 验证成功后删除验证码
        if (ENV.VERIFY_CODE_ONE_TIME) {
            k.cache.remove(cacheKey(accountType, accountTrim))
        }

        const user = findUserByAccount(accountTrim, accountType) as any
        if (!user || !user._id) throw new Error('账号不存在')

        // 更新最后登录时间
        Forum_User.updateById(user._id, { lastLoginAt: Date.now() } as any)

        return issueToken(user, isRemember)
    }

    throw new Error('登录方式错误')
}

/**
 * 发送验证码
 */
export function sendVerificationCode(body: {
    accountType: 'phone' | 'email'
    account: string
    codeType: 'login' | 'register' | 'forgot'
}) {
    const { accountType, account, codeType } = body
    let acc = account.trim()
    if (accountType === 'email') acc = acc.toLowerCase()

    if (!acc) {
        throw new Error(accountType === 'phone' ? '请输入手机号' : '请输入邮箱地址')
    }
    if (accountType === 'phone' && !isPhone(acc)) {
        throw new Error('请输入正确的手机号')
    }
    if (accountType === 'email' && !isEmail(acc)) {
        throw new Error('请输入正确的邮箱地址')
    }

    // 检查账号是否存在
    const existing = findUserByAccount(acc, accountType)
    if (codeType === 'login' || codeType === 'forgot') {
        if (!existing) {
            throw new Error(
                accountType === 'phone' ? '该手机号尚未注册' : '该邮箱尚未注册'
            )
        }
    }
    if (codeType === 'register' && existing) {
        throw new Error(accountType === 'phone' ? '手机号已存在' : '该邮箱已注册')
    }

    // 检查发送频率（60秒内只能发送一次）
    const lastSent = k.cache.get(`forum_verify_time_${accountType}_${acc}`)
    if (lastSent && Date.now() - lastSent < 60000) {
        throw new Error('验证码发送过于频繁，请稍后再试')
    }

    // 生成6位验证码
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    k.cache.set(cacheKey(accountType, acc), verificationCode, VERIFY_CODE_TTL)
    k.cache.set(`forum_verify_time_${accountType}_${acc}`, Date.now(), 60)

    let message = ''
    if (ENV.MOCK_SEND) {
        // 模拟发送（测试用）
        message = `验证码已发送到您的账号, 验证码: ${verificationCode}`
    } else {
        // 真实发送
        if (accountType === 'phone') {
            k.sms.aliSMS.send(ENV.SMS_TEMPLATE_ID, '+86' + acc, {
                code: verificationCode
            })
            message = '验证码已发送到您的手机号'
        } else {
            sendEmailCode(acc, verificationCode)
            message = '验证码已发送到您的邮箱'
        }
    }

    return {
        message,
        [accountType]: acc
    }
}

/**
 * 验证验证码
 */
export function verifyVerificationCode(body: {
    account: string
    accountType: 'phone' | 'email'
    code: string
}) {
    const { account, accountType, code } = body
    let acc = account.trim()
    if (accountType === 'email') acc = acc.toLowerCase()

    const key = cacheKey(accountType, acc)
    const stored = k.cache.get(key)

    // 验证成功后删除验证码
    if (ENV.VERIFY_CODE_ONE_TIME && stored && stored === code.trim()) {
        k.cache.remove(key)
    }

    if (!stored || stored !== code.trim()) {
        throw new Error('验证码错误或已过期')
    }
}

/**
 * 注册
 */
export function register(body: {
    userName?: string
    phone?: string
    email?: string
    password: string
    verificationCode: string
    accountType: 'username' | 'phone' | 'email'
}) {
    const { userName, phone, email, password, verificationCode, accountType } = body

    if (!password.trim()) throw new Error('请设置密码')
    const pwd = password.trim()
    if (pwd.length < 6) throw new Error('密码长度至少6位')
    if (pwd.length > 20) throw new Error('密码长度不能超过20位')

    // 用户名注册不需要验证码
    if (accountType !== 'username') {
        if (!verificationCode?.trim()) throw new Error('请输入验证码')
    }

    // 验证账号格式
    let normalizedAccount = ''
    if (accountType === 'phone') {
        if (!phone?.trim() || !isPhone(phone.trim())) {
            throw new Error('请输入正确的手机号')
        }
        normalizedAccount = phone.trim()
    } else if (accountType === 'email') {
        if (!email?.trim() || !isEmail(email.trim())) {
            throw new Error('请输入正确的邮箱地址')
        }
        normalizedAccount = email.trim().toLowerCase()
    } else {
        if (!userName?.trim() || !isUserName(userName.trim())) {
            throw new Error('请输入2-20位字母数字下划线组成的用户名')
        }
        normalizedAccount = userName.trim()
    }

    // 验证码验证 - 用户名注册不需要
    if (accountType !== 'username') {
        const key = cacheKey(accountType, normalizedAccount)
        const stored = k.cache.get(key)
        if (!stored || stored !== verificationCode.trim()) {
            throw new Error('验证码错误或已过期')
        }
        // 验证成功后删除验证码
        if (ENV.VERIFY_CODE_ONE_TIME) {
            k.cache.remove(key)
        }
    }

    // 检查账号是否已存在
    const existing = findUserByAccount(normalizedAccount, accountType)
    if (existing) {
        throw new Error(
            accountType === 'phone' ? '手机号已存在' :
            accountType === 'email' ? '该邮箱已注册' : '用户名已存在'
        )
    }

    // 检查用户名是否已存在（如果提供了用户名）
    if (userName?.trim()) {
        const userNameExists = Forum_User.findOne({ userName: userName.trim() } as any)
        if (userNameExists) {
            throw new Error('用户名已存在')
        }
    }

    // 创建用户
    const md5Password = k.security.md5(pwd)
    const createData: any = {
        userName: accountType === 'username' ? normalizedAccount : userName?.trim() || '',
        displayName: userName?.trim() || normalizedAccount,
        password: md5Password,
    }
    if (accountType === 'phone') {
        createData.phone = normalizedAccount
    } else if (accountType === 'email') {
        createData.email = normalizedAccount
    }

    const id = Forum_User.create(createData)
    const row = Forum_User.findById(id) as any
    if (!row || !row._id) throw new Error('注册失败，请稍后重试')

    return issueToken(row, false)
}

/**
 * 重置密码
 */
export function resetPassword(body: {
    account: string
    accountType: 'phone' | 'email' | 'username'
    newPassword: string
    verificationCode: string
}) {
    const { account, accountType, newPassword, verificationCode } = body
    const acc = account.trim()
    const pwd = newPassword.trim()

    if (!pwd) throw new Error('请输入新密码')
    if (pwd.length < 6) throw new Error('密码长度至少6位')
    if (pwd.length > 20) throw new Error('密码长度不能超过20位')

    // 验证验证码
    const key = cacheKey(accountType, acc)
    const stored = k.cache.get(key)
    if (!stored || stored !== verificationCode.trim()) {
        throw new Error('验证码错误或已过期')
    }
    // 验证成功后删除验证码
    if (ENV.VERIFY_CODE_ONE_TIME) {
        k.cache.remove(key)
    }

    // 查找用户
    const user = findUserByAccount(acc, accountType) as any
    if (!user || !user._id) throw new Error('账号不存在')

    // 更新密码
    const updated = Forum_User.updateById(user._id, {
        password: k.security.md5(pwd)
    } as any)
    if (!updated) throw new Error('密码重置失败')

    return
}

/**
 * 验证并解析 Token
 */
export function validateAuthToken(): TokenPayload | null {
    let token: string | undefined = k.request.headers.get?.('Authorization')
    if (!token) token = k.cookie.get?.(COOKIE_TOKEN_KEY)
    if (!token) return null
    if (token.startsWith('Bearer ')) token = token.slice(7)

    try {
        const decoded = k.security.jwt.decode(token)
        const payload = JSON.parse(decoded)?.value as TokenPayload | undefined
        if (!payload?.userId || !payload.exp) return null
        if (Date.now() > payload.exp) return null

        const user = Forum_User.findById(payload.userId)
        if (!user || !(user as any)._id) return null

        return payload
    } catch {
        return null
    }
}

/**
 * 发送邮箱验证码
 */
function sendEmailCode(email: string, code: string) {
    const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">验证码</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">您好！</p>
            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">您正在进行邮箱验证，验证码为：</p>
            <div style="background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${code}</span>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">验证码有效期为5分钟，请及时使用。</p>
            <p style="font-size: 14px; color: #666;">如果这不是您的操作，请忽略此邮件。</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>此邮件为系统自动发送，请勿回复。</p>
        </div>
    </div>
`

    const server = k.mail.createSmtpServer()
    server.host = ENV.EMAIL_HOST
    server.port = ENV.EMAIL_PORT
    server.ssl = ENV.EMAIL_SSL
    server.username = ENV.EMAIL_USERNAME
    server.password = ENV.EMAIL_PASSWORD

    const msg = k.mail.createMessage()
    msg.from = ENV.SENDER_EMAIL
    msg.to = email
    msg.subject = '论坛验证码'
    msg.htmlBody = emailContent
    k.mail.smtp.send(server, msg)
}

/**
 * 退出登录
 */
export function logout(): void {
    k.cookie.remove(COOKIE_TOKEN_KEY)
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
    const token = k.cookie.get(COOKIE_TOKEN_KEY)
    if (!token) return null

    const decoded = k.security.jwt.decode(token)
    const payload = JSON.parse(decoded)?.value as TokenPayload | undefined
    if (!payload?.userId || !payload.exp) return null
    if (Date.now() > payload.exp) return null

    const user = Forum_User.findById(payload.userId, {
        exclude: ['password']
    }) as any
    if (!user || !user._id) return null

    return {
        _id: user._id,
        userName: user.userName,
        displayName: user.displayName,
        phone: user.phone || '',
        email: user.email || '',
        avatar: user.avatar || '',
        role: user.role || 'user',
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
    }
}

/**
 * 获取用户详情
 */
export function getUserDetail(userId: string) {
    const user = Forum_User.findById(userId, {
        exclude: ['password']
    }) as any
    if (!user || !user._id) return null

    return {
        _id: user._id,
        userName: user.userName,
        displayName: user.displayName,
        phone: user.phone || '',
        email: user.email || '',
        avatar: user.avatar || '',
        role: user.role || 'user',
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
    }
}

/**
 * 更新当前登录用户资料（仅 displayName、avatar）
 * 必须已登录，仅能更新本人。
 */
export function updateProfile(updates: { displayName?: string; avatar?: string }) {
    const user = getCurrentUser()
    if (!user || !user._id) {
        throw new Error('请先登录')
    }
    const payload: Record<string, unknown> = {}
    if (updates.displayName !== undefined) {
        const trimmed = (updates.displayName || '').trim()
        if (trimmed.length > 50) throw new Error('昵称长度不能超过50')
        payload.displayName = trimmed || user.displayName
    }
    if (updates.avatar !== undefined) {
        payload.avatar = typeof updates.avatar === 'string' ? updates.avatar.trim() : ''
    }
    if (Object.keys(payload).length === 0) {
        return getUserDetail(user._id)
    }
    const updated = Forum_User.updateById(user._id, payload as any)
    if (!updated) throw new Error('更新失败')
    return getCurrentUser()
}
