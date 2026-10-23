package com.company.mono.common.exception;

/**
 * 全局错误码。业务模块扩展时从 10000 起分段，避免与通用错误码冲突。
 */
public enum ErrorCode {

    SUCCESS(0, "OK"),
    PARAM_INVALID(400, "参数不合法"),
    UNAUTHORIZED(401, "未认证或登录已过期"),
    FORBIDDEN(403, "无权限"),
    NOT_FOUND(404, "资源不存在"),
    CONFLICT(409, "资源状态冲突"),
    SYSTEM_ERROR(500, "系统繁忙，请稍后重试");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int code() {
        return code;
    }

    public String message() {
        return message;
    }
}
