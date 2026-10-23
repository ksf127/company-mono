package com.company.mono.order.controller;

import com.company.mono.common.api.ApiResult;
import com.company.mono.common.api.PageResult;
import com.company.mono.order.dto.OrderSaveRequest;
import com.company.mono.order.dto.OrderStatusRequest;
import com.company.mono.order.entity.BizOrder;
import com.company.mono.order.service.BizOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 订单示例接口，演示业务模块的标准分层写法。
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class BizOrderController {

    private final BizOrderService orderService;

    @GetMapping("/page")
    public ApiResult<PageResult<BizOrder>> page(@RequestParam(defaultValue = "1") int pageNum,
                                                @RequestParam(defaultValue = "10") int pageSize,
                                                @RequestParam(required = false) String keyword,
                                                @RequestParam(required = false) String status) {
        return ApiResult.ok(orderService.page(pageNum, pageSize, keyword, status));
    }

    @GetMapping("/{orderId}")
    public ApiResult<BizOrder> get(@PathVariable Long orderId) {
        return ApiResult.ok(orderService.get(orderId));
    }

    @PostMapping
    public ApiResult<BizOrder> create(@Valid @RequestBody OrderSaveRequest request) {
        return ApiResult.ok(orderService.create(request));
    }

    @PutMapping("/{orderId}")
    public ApiResult<Void> update(@PathVariable Long orderId, @Valid @RequestBody OrderSaveRequest request) {
        orderService.update(orderId, request);
        return ApiResult.ok();
    }

    @DeleteMapping("/{orderId}")
    public ApiResult<Void> delete(@PathVariable Long orderId) {
        orderService.delete(orderId);
        return ApiResult.ok();
    }

    @PostMapping("/{orderId}/status")
    public ApiResult<BizOrder> updateStatus(@PathVariable Long orderId, @Valid @RequestBody OrderStatusRequest request) {
        return ApiResult.ok(orderService.updateStatus(orderId, request.status()));
    }
}
