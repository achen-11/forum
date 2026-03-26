/**
 * 成功响应
 */
export function successResponse(data?: any, msg?: string) {
    return {
        code: 200,
        data,
        message: msg || 'success'
    }
}

/**
 * 异常响应
 */
export function failResponse(msg?: string, code?: number, data?: any) {
    const response = {
        code: code || 400,
        data,
        message: msg || 'fail'
    }
    k.response.json(response)
    return k.api.httpCode(code || 400)
}
