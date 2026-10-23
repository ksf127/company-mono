package com.company.mono.order.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.mono.common.api.PageResult;
import com.company.mono.common.exception.BizException;
import com.company.mono.common.exception.ErrorCode;
import com.company.mono.order.dto.OrderSaveRequest;
import com.company.mono.order.entity.BizOrder;
import com.company.mono.order.mapper.BizOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 订单示例服务：CRUD + 状态流转。
 * 状态机：CREATED -> PAID -> SHIPPED -> COMPLETED，CREATED 可直接 CANCELLED。
 */
@Service
@RequiredArgsConstructor
public class BizOrderService {

    public static final String STATUS_CREATED = "CREATED";

    private static final DateTimeFormatter ORDER_NO_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    private static final Map<String, Set<String>> TRANSITIONS = Map.of(
            STATUS_CREATED, Set.of("PAID", "CANCELLED"),
            "PAID", Set.of("SHIPPED"),
            "SHIPPED", Set.of("COMPLETED"),
            "COMPLETED", Set.of(),
            "CANCELLED", Set.of());

    private final BizOrderMapper orderMapper;

    public PageResult<BizOrder> page(int pageNum, int pageSize, String keyword, String status) {
        var wrapper = Wrappers.<BizOrder>lambdaQuery();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(BizOrder::getOrderNo, keyword).or().like(BizOrder::getCustomerName, keyword));
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(BizOrder::getStatus, status);
        }
        wrapper.orderByDesc(BizOrder::getOrderId);
        return PageResult.of(orderMapper.selectPage(Page.of(Math.max(pageNum, 1), Math.min(Math.max(pageSize, 1), 100)), wrapper));
    }

    public BizOrder get(Long orderId) {
        BizOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "订单不存在");
        }
        return order;
    }

    @Transactional
    public BizOrder create(OrderSaveRequest request) {
        BizOrder order = new BizOrder();
        order.setOrderNo(generateOrderNo());
        order.setCustomerName(request.customerName());
        order.setAmount(request.amount());
        order.setStatus(STATUS_CREATED);
        order.setRemark(request.remark());
        orderMapper.insert(order);
        return order;
    }

    /**
     * 只有待支付订单允许修改业务字段，已支付后金额不可再改。
     */
    @Transactional
    public void update(Long orderId, OrderSaveRequest request) {
        BizOrder order = get(orderId);
        if (!STATUS_CREATED.equals(order.getStatus())) {
            throw new BizException(ErrorCode.CONFLICT, "只有待支付订单可以修改");
        }
        order.setCustomerName(request.customerName());
        order.setAmount(request.amount());
        order.setRemark(request.remark());
        orderMapper.updateById(order);
    }

    @Transactional
    public void delete(Long orderId) {
        BizOrder order = get(orderId);
        if (!STATUS_CREATED.equals(order.getStatus()) && !"CANCELLED".equals(order.getStatus())) {
            throw new BizException(ErrorCode.CONFLICT, "已支付订单不可删除，请先取消");
        }
        orderMapper.deleteById(orderId);
    }

    /**
     * 状态流转：非法流转直接拒绝，避免出现跳过支付直接发货的数据。
     */
    @Transactional
    public BizOrder updateStatus(Long orderId, String targetStatus) {
        BizOrder order = get(orderId);
        Set<String> allowed = TRANSITIONS.getOrDefault(order.getStatus(), Set.of());
        if (!allowed.contains(targetStatus)) {
            throw new BizException(ErrorCode.CONFLICT,
                    "订单状态不允许从 " + order.getStatus() + " 流转到 " + targetStatus);
        }
        order.setStatus(targetStatus);
        orderMapper.updateById(order);
        return order;
    }

    private String generateOrderNo() {
        return "SO" + LocalDateTime.now().format(ORDER_NO_FORMAT)
                + ThreadLocalRandom.current().nextInt(100, 1000);
    }
}
