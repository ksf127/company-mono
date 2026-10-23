package com.company.mono.auth;

import com.company.mono.auth.dto.LoginRequest;
import com.company.mono.auth.dto.LoginResponse;
import com.company.mono.auth.dto.UserInfo;
import com.company.mono.common.api.ApiResult;
import com.company.mono.common.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证接口：登录、当前用户、登出。
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResult<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        return ApiResult.ok(authService.login(request, servletRequest.getRemoteAddr(), servletRequest.getHeader("User-Agent")));
    }

    @GetMapping("/me")
    public ApiResult<UserInfo> me() {
        return ApiResult.ok(authService.me());
    }

    @PostMapping("/logout")
    public ApiResult<Void> logout(HttpServletRequest servletRequest) {
        authService.logout(JwtAuthFilter.resolveToken(servletRequest));
        return ApiResult.ok();
    }
}
