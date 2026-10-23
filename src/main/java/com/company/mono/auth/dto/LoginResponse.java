package com.company.mono.auth.dto;

/**
 * 登录响应：token 由前端存入 localStorage，expiresIn 单位为秒。
 */
public record LoginResponse(
        String token,
        String tokenType,
        long expiresIn,
        UserInfo user) {
}
