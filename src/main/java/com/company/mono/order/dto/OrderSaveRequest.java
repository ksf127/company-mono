package com.company.mono.order.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * 订单新增/修改请求。订单号由服务端生成，状态通过独立接口流转。
 */
public record OrderSaveRequest(
        @NotBlank(message = "客户名称不能为空")
        @Size(max = 100, message = "客户名称不能超过 100 个字符")
        String customerName,

        @NotNull(message = "订单金额不能为空")
        @DecimalMin(value = "0.01", message = "订单金额必须大于 0")
        BigDecimal amount,

        @Size(max = 500, message = "备注不能超过 500 个字符")
        String remark) {
}
