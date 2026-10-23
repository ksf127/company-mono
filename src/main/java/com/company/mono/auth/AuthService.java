package com.company.mono.auth;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.company.mono.auth.dto.LoginRequest;
import com.company.mono.auth.dto.LoginResponse;
import com.company.mono.auth.dto.UserInfo;
import com.company.mono.common.exception.BizException;
import com.company.mono.common.exception.ErrorCode;
import com.company.mono.common.security.JwtService;
import com.company.mono.common.security.TokenBlacklist;
import com.company.mono.common.security.UserContext;
import com.company.mono.system.entity.SysLoginLog;
import com.company.mono.system.entity.SysUser;
import com.company.mono.system.mapper.SysLoginLogMapper;
import com.company.mono.system.mapper.SysRoleMapper;
import com.company.mono.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 认证服务：校验账号密码、签发 JWT、记录登录日志、维护登出黑名单。
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final String STATUS_NORMAL = "0";
    private static final String LOG_SUCCESS = "0";
    private static final String LOG_FAIL = "1";

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysLoginLogMapper loginLogMapper;
    private final JwtService jwtService;
    private final TokenBlacklist tokenBlacklist;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request, String ip, String userAgent) {
        SysUser user = userMapper.selectOne(Wrappers.<SysUser>lambdaQuery()
                .eq(SysUser::getUserName, request.username())
                .last("LIMIT 1"));

        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            recordLog(request.username(), ip, userAgent, LOG_FAIL, "账号或密码错误");
            throw new BizException(ErrorCode.UNAUTHORIZED, "用户名或密码错误");
        }
        if (!STATUS_NORMAL.equals(user.getStatus())) {
            recordLog(request.username(), ip, userAgent, LOG_FAIL, "账号已停用");
            throw new BizException(ErrorCode.FORBIDDEN, "账号已停用，请联系管理员");
        }

        String token = jwtService.generateToken(user.getUserId(), user.getUserName());
        recordLog(request.username(), ip, userAgent, LOG_SUCCESS, "登录成功");
        return new LoginResponse(token, "Bearer", jwtService.expireSeconds(), toUserInfo(user));
    }

    /**
     * 当前登录用户信息，登录态由 JwtAuthFilter 写入 UserContext。
     */
    public UserInfo me() {
        Long userId = UserContext.required().userId();
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "用户不存在或已被删除");
        }
        return toUserInfo(user);
    }

    /**
     * 登出：把当前 token 的 jti 放入黑名单，直到 token 自然过期。
     * 生产环境建议改为 Redis 存储，保证多实例一致。
     */
    public void logout(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        var claims = jwtService.parse(token);
        if (claims == null) {
            return;
        }
        tokenBlacklist.revoke(claims.getId(), claims.getExpiration().getTime());
    }

    private UserInfo toUserInfo(SysUser user) {
        List<String> roles = roleMapper.selectRoleKeysByUserId(user.getUserId());
        return new UserInfo(user.getUserId(), user.getUserName(), user.getNickName(), user.getDeptId(), roles);
    }

    /**
     * 登录日志写入失败不应阻断登录流程，只记录告警。
     */
    private void recordLog(String userName, String ip, String userAgent, String status, String msg) {
        try {
            SysLoginLog loginLog = new SysLoginLog();
            loginLog.setUserName(userName);
            loginLog.setIpaddr(ip);
            loginLog.setBrowser(truncate(userAgent));
            loginLog.setOs(resolveOs(userAgent));
            loginLog.setStatus(status);
            loginLog.setMsg(msg);
            loginLog.setLoginTime(LocalDateTime.now());
            loginLogMapper.insert(loginLog);
        } catch (RuntimeException e) {
            log.warn("写入登录日志失败: userName={}, msg={}", userName, e.getMessage());
        }
    }

    private String resolveOs(String userAgent) {
        if (userAgent == null) {
            return "unknown";
        }
        String ua = userAgent.toLowerCase();
        if (ua.contains("windows")) {
            return "Windows";
        }
        if (ua.contains("mac os")) {
            return "macOS";
        }
        if (ua.contains("android")) {
            return "Android";
        }
        if (ua.contains("iphone") || ua.contains("ipad")) {
            return "iOS";
        }
        if (ua.contains("linux")) {
            return "Linux";
        }
        return "unknown";
    }

    private String truncate(String value) {
        if (value == null) {
            return "unknown";
        }
        return value.length() > 200 ? value.substring(0, 200) : value;
    }
}
