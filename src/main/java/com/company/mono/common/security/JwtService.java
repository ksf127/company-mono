package com.company.mono.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * JWT 签发与解析：HS256，subject 存用户 ID，附带用户名与 jti。
 */
@Component
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey key;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        byte[] secret = properties.secret() == null ? new byte[0] : properties.secret().getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) {
            throw new IllegalStateException("app.jwt.secret 至少需要 32 字节（当前 " + secret.length + " 字节）");
        }
        this.key = Keys.hmacShaKeyFor(secret);
    }

    /**
     * 签发 token，jti 用于登出后加入黑名单。
     */
    public String generateToken(Long userId, String userName) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + properties.expireMinutes() * 60_000L);
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("userName", userName)
                .id(UUID.randomUUID().toString())
                .issuer(properties.issuer())
                .issuedAt(now)
                .expiration(expiration)
                .signWith(key)
                .compact();
    }

    /**
     * 解析并校验签名与有效期，失败返回 null，由调用方决定是否拒绝请求。
     */
    public Claims parse(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(properties.issuer())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    public long expireSeconds() {
        return properties.expireMinutes() * 60L;
    }
}
