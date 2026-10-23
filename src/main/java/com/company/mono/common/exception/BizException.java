package com.company.mono.common.exception;

/**
 * 业务异常：只承载可对外展示的错误码与提示，不保存堆栈。
 */
public class BizException extends RuntimeException {

    private final ErrorCode errorCode;

    public BizException(ErrorCode errorCode, String message) {
        super(message == null ? errorCode.message() : message);
        this.errorCode = errorCode;
    }

    public BizException(ErrorCode errorCode) {
        this(errorCode, errorCode.message());
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
}
