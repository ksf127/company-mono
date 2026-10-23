package com.company.mono.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.company.mono.common.exception.BizException;
import com.company.mono.common.exception.ErrorCode;
import com.company.mono.system.dto.SysRoleRequest;
import com.company.mono.system.entity.SysRole;
import com.company.mono.system.mapper.SysRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 角色管理：列表与增删改。
 */
@Service
@RequiredArgsConstructor
public class SysRoleService {

    private static final long BUILT_IN_ADMIN_ROLE_ID = 1L;

    private final SysRoleMapper roleMapper;

    public List<SysRole> list() {
        return roleMapper.selectList(Wrappers.<SysRole>lambdaQuery().orderByAsc(SysRole::getRoleSort));
    }

    public SysRole create(SysRoleRequest request) {
        Long exists = roleMapper.selectCount(Wrappers.<SysRole>lambdaQuery().eq(SysRole::getRoleKey, request.roleKey()));
        if (exists != null && exists > 0) {
            throw new BizException(ErrorCode.CONFLICT, "角色标识已存在");
        }
        SysRole role = new SysRole();
        apply(role, request);
        roleMapper.insert(role);
        return role;
    }

    @Transactional
    public void update(Long roleId, SysRoleRequest request) {
        SysRole role = get(roleId);
        Long duplicated = roleMapper.selectCount(Wrappers.<SysRole>lambdaQuery()
                .eq(SysRole::getRoleKey, request.roleKey())
                .ne(SysRole::getRoleId, roleId));
        if (duplicated != null && duplicated > 0) {
            throw new BizException(ErrorCode.CONFLICT, "角色标识已存在");
        }
        apply(role, request);
        roleMapper.updateById(role);
    }

    public void delete(Long roleId) {
        if (roleId == BUILT_IN_ADMIN_ROLE_ID) {
            throw new BizException(ErrorCode.CONFLICT, "内置管理员角色不可删除");
        }
        get(roleId);
        roleMapper.deleteById(roleId);
    }

    private SysRole get(Long roleId) {
        SysRole role = roleMapper.selectById(roleId);
        if (role == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "角色不存在");
        }
        return role;
    }

    private void apply(SysRole role, SysRoleRequest request) {
        role.setRoleName(request.roleName());
        role.setRoleKey(request.roleKey());
        role.setRoleSort(request.roleSort() == null ? 0 : request.roleSort());
        role.setStatus(StringUtils.hasText(request.status()) ? request.status() : "0");
        role.setRemark(request.remark());
    }
}
