package com.company.mono.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 字典数据新增/修改请求。
 */
public record SysDictDataRequest(
        @NotBlank(message = "字典类型不能为空")
        String dictType,

        @NotBlank(message = "字典标签不能为空")
        @Size(max = 100, message = "字典标签不能超过 100 个字符")
        String dictLabel,

        @NotBlank(message = "字典键值不能为空")
        @Size(max = 100, message = "字典键值不能超过 100 个字符")
        String dictValue,

        Integer dictSort,

        @Size(max = 100, message = "样式类名不能超过 100 个字符")
        String listClass,

        @Pattern(regexp = "^[01]$", message = "是否默认只能是 0/1")
        String isDefault,

        @Pattern(regexp = "^[01]$", message = "状态只能是 0/1")
        String status,

        @Size(max = 500, message = "备注不能超过 500 个字符")
        String remark) {
}
