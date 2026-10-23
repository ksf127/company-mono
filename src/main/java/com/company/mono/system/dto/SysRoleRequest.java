package com.company.mono.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 角色新增/修改请求。
 */
public record SysRoleRequest(
        @NotBlank(message = "角色名称不能为空")
        @Size(max = 64, message = "角色名称不能超过 64 个字符")
        String roleName,

        @NotBlank(message = "角色标识不能为空")
        @Size(max = 64, message = "角色标识不能超过 64 个字符")
        String roleKey,

        Integer roleSort,

        @Pattern(regexp = "^[01]$", message = "状态只能是 0/1")
        String status,

        @Size(max = 500, message = "备注不能超过 500 个字符")
        String remark) {
}
