package com.company.mono.system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 部门新增/修改请求。
 */
public record SysDeptRequest(
        @NotBlank(message = "部门名称不能为空")
        @Size(max = 64, message = "部门名称不能超过 64 个字符")
        String deptName,

        Long parentId,

        Integer orderNum,

        @Size(max = 64, message = "负责人不能超过 64 个字符")
        String leader,

        @Size(max = 20, message = "联系电话不能超过 20 个字符")
        String phone,

        @Email(message = "邮箱格式不正确")
        @Size(max = 100, message = "邮箱不能超过 100 个字符")
        String email,

        @Pattern(regexp = "^[01]$", message = "状态只能是 0/1")
        String status) {
}
