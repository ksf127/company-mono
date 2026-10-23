package com.company.mono.common.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * JWT 配置。secret 必须至少 32 字节，生产通过环境变量 JWT_SECRET 覆盖。
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(String secret, long expireMinutes, String issuer) {
}
