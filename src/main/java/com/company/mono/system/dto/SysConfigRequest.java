package com.company.mono.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 参数更新请求。
 */
public record SysConfigRequest(
        @NotBlank(message = "参数名称不能为空")
        @Size(max = 100, message = "参数名称不能超过 100 个字符")
        String configName,

        @NotBlank(message = "参数键值不能为空")
        @Size(max = 500, message = "参数键值不能超过 500 个字符")
        String configValue,

        @Size(max = 500, message = "备注不能超过 500 个字符")
        String remark) {
}
