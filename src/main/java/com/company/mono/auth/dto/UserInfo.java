package com.company.mono.auth.dto;

import java.util.List;

/**
 * 登录用户信息，登录与 /api/auth/me 共用。
 */
public record UserInfo(
        Long userId,
        String userName,
        String nickName,
        Long deptId,
        List<String> roles) {
}
