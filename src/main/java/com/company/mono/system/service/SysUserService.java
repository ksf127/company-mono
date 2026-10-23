package com.company.mono.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.mono.common.api.PageResult;
import com.company.mono.common.exception.BizException;
import com.company.mono.common.exception.ErrorCode;
import com.company.mono.common.security.UserContext;
import com.company.mono.system.dto.SysUserRequest;
import com.company.mono.system.entity.SysUser;
import com.company.mono.system.mapper.SysRoleMapper;
import com.company.mono.system.mapper.SysUserMapper;
import com.company.mono.system.mapper.SysUserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 用户管理：分页查询、增删改、角色关联。
 */
@Service
@RequiredArgsConstructor
public class SysUserService {

    private static final String DEFAULT_PASSWORD = "123456";
    private static final long BUILT_IN_ADMIN_ID = 1L;

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;

    public PageResult<SysUser> page(int pageNum, int pageSize, String keyword) {
        var wrapper = Wrappers.<SysUser>lambdaQuery();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(SysUser::getUserName, keyword)
                    .or().like(SysUser::getNickName, keyword)
                    .or().like(SysUser::getPhonenumber, keyword));
        }
        wrapper.orderByAsc(SysUser::getUserId);
        return PageResult.of(userMapper.selectPage(Page.of(normalizePage(pageNum), normalizeSize(pageSize)), wrapper));
    }

    public SysUser get(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "用户不存在");
        }
        return user;
    }

    public List<Long> roleIds(Long userId) {
        return roleMapper.selectRoleIdsByUserId(userId);
    }

    @Transactional
    public SysUser create(SysUserRequest request) {
        Long exists = userMapper.selectCount(Wrappers.<SysUser>lambdaQuery().eq(SysUser::getUserName, request.userName()));
        if (exists != null && exists > 0) {
            throw new BizException(ErrorCode.CONFLICT, "登录账号已存在");
        }

        SysUser user = new SysUser();
        user.setUserName(request.userName());
        user.setNickName(request.nickName());
        user.setPassword(passwordEncoder.encode(StringUtils.hasText(request.password()) ? request.password() : DEFAULT_PASSWORD));
        user.setDeptId(request.deptId());
        user.setPhonenumber(request.phonenumber());
        user.setEmail(request.email());
        user.setSex(StringUtils.hasText(request.sex()) ? request.sex() : "2");
        user.setStatus(StringUtils.hasText(request.status()) ? request.status() : "0");
        user.setRemark(request.remark());
        userMapper.insert(user);

        assignRoles(user.getUserId(), request.roleIds());
        return user;
    }

    @Transactional
    public void update(Long userId, SysUserRequest request) {
        SysUser existing = get(userId);
        Long duplicated = userMapper.selectCount(Wrappers.<SysUser>lambdaQuery()
                .eq(SysUser::getUserName, request.userName())
                .ne(SysUser::getUserId, userId));
        if (duplicated != null && duplicated > 0) {
            throw new BizException(ErrorCode.CONFLICT, "登录账号已存在");
        }

        existing.setUserName(request.userName());
        existing.setNickName(request.nickName());
        if (StringUtils.hasText(request.password())) {
            existing.setPassword(passwordEncoder.encode(request.password()));
        }
        existing.setDeptId(request.deptId());
        existing.setPhonenumber(request.phonenumber());
        existing.setEmail(request.email());
        existing.setSex(request.sex());
        existing.setStatus(request.status());
        existing.setRemark(request.remark());
        userMapper.updateById(existing);

        assignRoles(userId, request.roleIds());
    }

    @Transactional
    public void delete(Long userId) {
        if (userId == BUILT_IN_ADMIN_ID) {
            throw new BizException(ErrorCode.CONFLICT, "内置管理员不可删除");
        }
        UserContext.CurrentUser current = UserContext.get();
        if (current != null && current.userId().equals(userId)) {
            throw new BizException(ErrorCode.CONFLICT, "不能删除当前登录用户");
        }
        get(userId);
        userMapper.deleteById(userId);
        userRoleMapper.deleteByUserId(userId);
    }

    private void assignRoles(Long userId, List<Long> roleIds) {
        userRoleMapper.deleteByUserId(userId);
        if (roleIds != null && !roleIds.isEmpty()) {
            userRoleMapper.insertBatch(userId, roleIds);
        }
    }

    private int normalizePage(int pageNum) {
        return Math.max(pageNum, 1);
    }

    private int normalizeSize(int pageSize) {
        return Math.min(Math.max(pageSize, 1), 100);
    }
}
