package com.company.mono.system.controller;

import com.company.mono.common.api.ApiResult;
import com.company.mono.system.dto.SysDeptRequest;
import com.company.mono.system.entity.SysDept;
import com.company.mono.system.service.SysDeptService;
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
 * 部门管理接口，列表以树形返回。
 */
@RestController
@RequestMapping("/api/system/depts")
@RequiredArgsConstructor
public class SysDeptController {

    private final SysDeptService deptService;

    @GetMapping("/tree")
    public ApiResult<List<SysDept>> tree() {
        return ApiResult.ok(deptService.tree());
    }

    @PostMapping
    public ApiResult<SysDept> create(@Valid @RequestBody SysDeptRequest request) {
        return ApiResult.ok(deptService.create(request));
    }

    @PutMapping("/{deptId}")
    public ApiResult<Void> update(@PathVariable Long deptId, @Valid @RequestBody SysDeptRequest request) {
        deptService.update(deptId, request);
        return ApiResult.ok();
    }

    @DeleteMapping("/{deptId}")
    public ApiResult<Void> delete(@PathVariable Long deptId) {
        deptService.delete(deptId);
        return ApiResult.ok();
    }
}
