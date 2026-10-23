package com.company.mono.system.controller;

import com.company.mono.common.api.ApiResult;
import com.company.mono.system.dto.SysMenuRequest;
import com.company.mono.system.entity.SysMenu;
import com.company.mono.system.service.SysMenuService;
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
 * 菜单管理接口，列表以树形返回。
 */
@RestController
@RequestMapping("/api/system/menus")
@RequiredArgsConstructor
public class SysMenuController {

    private final SysMenuService menuService;

    @GetMapping("/tree")
    public ApiResult<List<SysMenu>> tree() {
        return ApiResult.ok(menuService.tree());
    }

    @PostMapping
    public ApiResult<SysMenu> create(@Valid @RequestBody SysMenuRequest request) {
        return ApiResult.ok(menuService.create(request));
    }

    @PutMapping("/{menuId}")
    public ApiResult<Void> update(@PathVariable Long menuId, @Valid @RequestBody SysMenuRequest request) {
        menuService.update(menuId, request);
        return ApiResult.ok();
    }

    @DeleteMapping("/{menuId}")
    public ApiResult<Void> delete(@PathVariable Long menuId) {
        menuService.delete(menuId);
        return ApiResult.ok();
    }
}
