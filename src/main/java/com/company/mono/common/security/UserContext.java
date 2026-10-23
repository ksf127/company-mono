package com.company.mono.common.security;

import com.company.mono.common.exception.BizException;
import com.company.mono.common.exception.ErrorCode;

/**
 * 当前请求的登录用户上下文，由 JwtAuthFilter 写入并在 finally 中清理。
 */
public final class UserContext {

    private static final ThreadLocal<CurrentUser> HOLDER = new ThreadLocal<>();

    private UserContext() {
    }

    public record CurrentUser(Long userId, String userName) {
    }

    public static void set(CurrentUser user) {
        HOLDER.set(user);
    }

    public static CurrentUser get() {
        return HOLDER.get();
    }

    public static CurrentUser required() {
        CurrentUser user = HOLDER.get();
        if (user == null) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "未获取到登录信息");
        }
        return user;
    }

    public static void clear() {
        HOLDER.remove();
    }
}
