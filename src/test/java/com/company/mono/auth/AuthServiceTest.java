package com.company.mono.auth;

import com.company.mono.auth.dto.LoginRequest;
import com.company.mono.auth.dto.LoginResponse;
import com.company.mono.common.exception.BizException;
import com.company.mono.common.exception.ErrorCode;
import com.company.mono.common.security.JwtService;
import com.company.mono.common.security.TokenBlacklist;
import com.company.mono.system.entity.SysUser;
import com.company.mono.system.mapper.SysLoginLogMapper;
import com.company.mono.system.mapper.SysRoleMapper;
import com.company.mono.system.mapper.SysUserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 认证服务单元测试：不启动 Spring、不连接数据库。
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private SysUserMapper userMapper;
    @Mock
    private SysRoleMapper roleMapper;
    @Mock
    private SysLoginLogMapper loginLogMapper;
    @Mock
    private JwtService jwtService;
    @Mock
    private TokenBlacklist tokenBlacklist;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userMapper, roleMapper, loginLogMapper, jwtService, tokenBlacklist, passwordEncoder);
    }

    @Test
    void 登录成功返回_token_与用户信息() {
        SysUser user = user(1L, "admin", passwordEncoder.encode("admin123"), "0");
        when(userMapper.selectOne(any())).thenReturn(user);
        when(jwtService.generateToken(1L, "admin")).thenReturn("token-value");
        when(jwtService.expireSeconds()).thenReturn(7200L);
        when(roleMapper.selectRoleKeysByUserId(1L)).thenReturn(List.of("admin"));

        LoginResponse response = authService.login(new LoginRequest("admin", "admin123"), "127.0.0.1", "JUnit");

        assertThat(response.token()).isEqualTo("token-value");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.expiresIn()).isEqualTo(7200L);
        assertThat(response.user().userName()).isEqualTo("admin");
        assertThat(response.user().roles()).containsExactly("admin");
        verify(loginLogMapper).insert(any());
    }

    @Test
    void 密码错误抛出未认证异常并记录失败日志() {
        SysUser user = user(1L, "admin", passwordEncoder.encode("admin123"), "0");
        when(userMapper.selectOne(any())).thenReturn(user);

        assertThatThrownBy(() -> authService.login(new LoginRequest("admin", "wrong-pass"), "127.0.0.1", "JUnit"))
                .isInstanceOf(BizException.class)
                .extracting(e -> ((BizException) e).getErrorCode())
                .isEqualTo(ErrorCode.UNAUTHORIZED);
        verify(loginLogMapper).insert(any());
    }

    @Test
    void 用户被禁用时拒绝登录() {
        SysUser user = user(1L, "admin", passwordEncoder.encode("admin123"), "1");
        when(userMapper.selectOne(any())).thenReturn(user);

        assertThatThrownBy(() -> authService.login(new LoginRequest("admin", "admin123"), "127.0.0.1", "JUnit"))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("停用")
                .extracting(e -> ((BizException) e).getErrorCode())
                .isEqualTo(ErrorCode.FORBIDDEN);
    }

    private SysUser user(Long id, String userName, String password, String status) {
        SysUser user = new SysUser();
        user.setUserId(id);
        user.setUserName(userName);
        user.setNickName("测试用户");
        user.setPassword(password);
        user.setStatus(status);
        return user;
    }
}
