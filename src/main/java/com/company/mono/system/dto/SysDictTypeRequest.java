package com.company.mono.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 字典类型新增/修改请求。
 */
public record SysDictTypeRequest(
        @NotBlank(message = "字典名称不能为空")
        @Size(max = 100, message = "字典名称不能超过 100 个字符")
        String dictName,

        @NotBlank(message = "字典类型不能为空")
        @Size(max = 100, message = "字典类型不能超过 100 个字符")
        String dictType,

        @Pattern(regexp = "^[01]$", message = "状态只能是 0/1")
        String status,

        @Size(max = 500, message = "备注不能超过 500 个字符")
        String remark) {
}
