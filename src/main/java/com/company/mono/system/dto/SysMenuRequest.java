package com.company.mono.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 菜单新增/修改请求。menuType：M 目录 / C 菜单 / F 按钮。
 */
public record SysMenuRequest(
        @NotBlank(message = "菜单名称不能为空")
        @Size(max = 64, message = "菜单名称不能超过 64 个字符")
        String menuName,

        Long parentId,

        Integer orderNum,

        @Size(max = 200, message = "路由地址不能超过 200 个字符")
        String path,

        @Size(max = 200, message = "组件路径不能超过 200 个字符")
        String component,

        @NotBlank(message = "菜单类型不能为空")
        @Pattern(regexp = "^[MCF]$", message = "菜单类型只能是 M/C/F")
        String menuType,

        @Size(max = 100, message = "权限标识不能超过 100 个字符")
        String perms,

        @Size(max = 64, message = "图标不能超过 64 个字符")
        String icon,

        @Pattern(regexp = "^[01]$", message = "状态只能是 0/1")
        String status) {
}
