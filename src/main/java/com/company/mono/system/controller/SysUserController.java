package com.company.mono.system.controller;

import com.company.mono.common.api.ApiResult;
import com.company.mono.common.api.PageResult;
import com.company.mono.system.dto.SysUserRequest;
import com.company.mono.system.entity.SysUser;
import com.company.mono.system.service.SysUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 用户管理接口。
 */
@RestController
@RequestMapping("/api/system/users")
@RequiredArgsConstructor
public class SysUserController {

    private final SysUserService userService;

    @GetMapping("/page")
    public ApiResult<PageResult<SysUser>> page(@RequestParam(defaultValue = "1") int pageNum,
                                               @RequestParam(defaultValue = "10") int pageSize,
                                               @RequestParam(required = false) String keyword) {
        return ApiResult.ok(userService.page(pageNum, pageSize, keyword));
    }

    @GetMapping("/{userId}")
    public ApiResult<SysUser> get(@PathVariable Long userId) {
        return ApiResult.ok(userService.get(userId));
    }

    @GetMapping("/{userId}/role-ids")
    public ApiResult<List<Long>> roleIds(@PathVariable Long userId) {
        return ApiResult.ok(userService.roleIds(userId));
    }

    @PostMapping
    public ApiResult<SysUser> create(@Valid @RequestBody SysUserRequest request) {
        return ApiResult.ok(userService.create(request));
    }

    @PutMapping("/{userId}")
    public ApiResult<Void> update(@PathVariable Long userId, @Valid @RequestBody SysUserRequest request) {
        userService.update(userId, request);
        return ApiResult.ok();
    }

    @DeleteMapping("/{userId}")
    public ApiResult<Void> delete(@PathVariable Long userId) {
        userService.delete(userId);
        return ApiResult.ok();
    }
}
