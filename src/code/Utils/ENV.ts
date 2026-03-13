/**
 * 论坛环境配置
 * 从 Kooboo 设置中读取配置
 */
const emailConfig = k.paramConfig.emailConfig
const ENV = {
    /** 虚拟发送验证码 (测试用) */
    MOCK_SEND: true,
    /** 正确验证后是否立即失效（一次性验证码） */
    VERIFY_CODE_ONE_TIME: true,
    /** 邮箱配置 */
    EMAIL_HOST: emailConfig?.host || '',
    EMAIL_PORT: emailConfig?.port || 465,
    EMAIL_SSL: emailConfig?.ssl !== false,
    EMAIL_USERNAME: emailConfig?.userName || '',
    SENDER_EMAIL: emailConfig?.sendEmail || '',
    EMAIL_PASSWORD: emailConfig?.password || '',
}
export default ENV
