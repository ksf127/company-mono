package com.company.mono.common.api;

import com.company.mono.common.exception.ErrorCode;

/**
 * 统一返回结构：code == 0 表示成功，非 0 由前端按错误码处理。
 */
public record ApiResult<T>(int code, String message, T data) {

    public static <T> ApiResult<T> ok(T data) {
        return new ApiResult<>(ErrorCode.SUCCESS.code(), "OK", data);
    }

    public static ApiResult<Void> ok() {
        return new ApiResult<>(ErrorCode.SUCCESS.code(), "OK", null);
    }

    public static <T> ApiResult<T> fail(ErrorCode errorCode, String message) {
        return new ApiResult<>(errorCode.code(), message == null ? errorCode.message() : message, null);
    }
}
