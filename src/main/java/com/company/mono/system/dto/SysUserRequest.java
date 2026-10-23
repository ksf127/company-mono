package com.company.mono.system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 用户新增/修改请求。password 留空表示不修改。
 */
public record SysUserRequest(
        @NotBlank(message = "登录账号不能为空")
        @Size(max = 64, message = "登录账号不能超过 64 个字符")
        String userName,

        @NotBlank(message = "用户昵称不能为空")
        @Size(max = 64, message = "用户昵称不能超过 64 个字符")
        String nickName,

        @Pattern(regexp = "^$|^.{6,64}$", message = "密码长度需为 6-64 位")
        String password,

        Long deptId,

        @Size(max = 20, message = "手机号不能超过 20 个字符")
        String phonenumber,

        @Email(message = "邮箱格式不正确")
        @Size(max = 100, message = "邮箱不能超过 100 个字符")
        String email,

        @Pattern(regexp = "^[012]$", message = "性别只能是 0/1/2")
        String sex,

        @Pattern(regexp = "^[01]$", message = "状态只能是 0/1")
        String status,

        @Size(max = 500, message = "备注不能超过 500 个字符")
        String remark,

        List<Long> roleIds) {
}
