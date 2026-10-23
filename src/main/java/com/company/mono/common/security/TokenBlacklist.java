package com.company.mono.common.security;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 登出 token 黑名单。
 *
 * 说明：当前实现是进程内 ConcurrentHashMap，按 jti 记录过期时间，读取时顺带清理过期项。
 * 生产环境应替换为 Redis（SET jti 1 EX ttl），否则多实例部署时登出只在当前节点生效。
 */
@Component
public class TokenBlacklist {

    private final Map<String, Long> revoked = new ConcurrentHashMap<>();

    /**
     * 记录一个已登出的 jti，expireAt 为 token 自身的过期时间戳（毫秒）。
     */
    public void revoke(String jti, long expireAt) {
        if (jti == null || jti.isBlank()) {
            return;
        }
        long now = System.currentTimeMillis();
        revoked.entrySet().removeIf(entry -> entry.getValue() <= now);
        revoked.put(jti, expireAt);
    }

    public boolean isRevoked(String jti) {
        if (jti == null) {
            return false;
        }
        Long expireAt = revoked.get(jti);
        if (expireAt == null) {
            return false;
        }
        if (expireAt <= System.currentTimeMillis()) {
            revoked.remove(jti);
            return false;
        }
        return true;
    }

    public int size() {
        return revoked.size();
    }
}
