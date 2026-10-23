package com.company.mono.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * 订单状态流转请求。
 */
public record OrderStatusRequest(
        @NotBlank(message = "目标状态不能为空")
        @Pattern(regexp = "^(PAID|SHIPPED|COMPLETED|CANCELLED)$", message = "不支持的订单状态")
        String status) {
}
