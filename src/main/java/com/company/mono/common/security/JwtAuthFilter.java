package com.company.mono.common.security;

import com.company.mono.common.api.ApiResult;
import com.company.mono.common.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * 认证过滤器：/api 下的接口除登录外都必须携带有效 token。
 * 校验通过后把用户写入 UserContext，请求结束立即清理，避免线程复用串号。
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String LOGIN_PATH = "/api/auth/login";

    private final JwtService jwtService;
    private final TokenBlacklist tokenBlacklist;
    private final ObjectMapper objectMapper;

    public JwtAuthFilter(JwtService jwtService, TokenBlacklist tokenBlacklist, ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.tokenBlacklist = tokenBlacklist;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        // 预检请求、非 /api 路径、登录接口直接放行
        if (HttpMethod.OPTIONS.matches(request.getMethod()) || !path.startsWith("/api") || LOGIN_PATH.equals(path)) {
            chain.doFilter(request, response);
            return;
        }

        String token = resolveToken(request);
        Claims claims = token == null ? null : jwtService.parse(token);
        if (claims == null) {
            writeUnauthorized(response, "登录状态无效，请重新登录");
            return;
        }
        if (tokenBlacklist.isRevoked(claims.getId())) {
            writeUnauthorized(response, "登录已退出，请重新登录");
            return;
        }

        try {
            UserContext.set(new UserContext.CurrentUser(Long.valueOf(claims.getSubject()), claims.get("userName", String.class)));
            chain.doFilter(request, response);
        } finally {
            UserContext.clear();
        }
    }

    /**
     * 从 Authorization 头取 token，供 Controller 与 Service 复用同一套解析规则。
     */
    public static String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            return null;
        }
        String token = header.substring(BEARER_PREFIX.length()).trim();
        return token.isEmpty() ? null : token;
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), ApiResult.fail(ErrorCode.UNAUTHORIZED, message));
    }
}
