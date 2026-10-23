package com.company.mono.system.controller;

import com.company.mono.common.api.ApiResult;
import com.company.mono.system.dto.SysRoleRequest;
import com.company.mono.system.entity.SysRole;
import com.company.mono.system.service.SysRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 角色管理接口。
 */
@RestController
@RequestMapping("/api/system/roles")
@RequiredArgsConstructor
public class SysRoleController {

    private final SysRoleService roleService;

    @GetMapping
    public ApiResult<List<SysRole>> list() {
        return ApiResult.ok(roleService.list());
    }

    @PostMapping
    public ApiResult<SysRole> create(@Valid @RequestBody SysRoleRequest request) {
        return ApiResult.ok(roleService.create(request));
    }

    @PutMapping("/{roleId}")
    public ApiResult<Void> update(@PathVariable Long roleId, @Valid @RequestBody SysRoleRequest request) {
        roleService.update(roleId, request);
        return ApiResult.ok();
    }

    @DeleteMapping("/{roleId}")
    public ApiResult<Void> delete(@PathVariable Long roleId) {
        roleService.delete(roleId);
        return ApiResult.ok();
    }
}
