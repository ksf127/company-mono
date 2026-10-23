package com.company.mono.order;

import com.company.mono.common.exception.BizException;
import com.company.mono.order.dto.OrderSaveRequest;
import com.company.mono.order.entity.BizOrder;
import com.company.mono.order.mapper.BizOrderMapper;
import com.company.mono.order.service.BizOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 订单服务单元测试：覆盖创建与状态流转，不依赖数据库。
 */
@ExtendWith(MockitoExtension.class)
class BizOrderServiceTest {

    @Mock
    private BizOrderMapper orderMapper;

    private BizOrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new BizOrderService(orderMapper);
    }

    @Test
    void 创建订单生成订单号且初始状态为_CREATED() {
        when(orderMapper.insert(any())).thenAnswer(invocation -> {
            BizOrder order = invocation.getArgument(0);
            order.setOrderId(100L);
            return 1;
        });

        BizOrder created = orderService.create(new OrderSaveRequest("测试客户", new BigDecimal("199.00"), "备注"));

        assertThat(created.getOrderId()).isEqualTo(100L);
        assertThat(created.getOrderNo()).startsWith("SO");
        assertThat(created.getStatus()).isEqualTo(BizOrderService.STATUS_CREATED);
        assertThat(created.getAmount()).isEqualByComparingTo("199.00");
        verify(orderMapper).insert(any());
    }

    @Test
    void 待支付订单可以流转为已支付() {
        BizOrder order = order(1L, BizOrderService.STATUS_CREATED);
        when(orderMapper.selectById(1L)).thenReturn(order);

        BizOrder updated = orderService.updateStatus(1L, "PAID");

        assertThat(updated.getStatus()).isEqualTo("PAID");
        verify(orderMapper).updateById(order);
    }

    @Test
    void 非法状态流转被拒绝() {
        BizOrder order = order(1L, BizOrderService.STATUS_CREATED);
        when(orderMapper.selectById(1L)).thenReturn(order);

        assertThatThrownBy(() -> orderService.updateStatus(1L, "COMPLETED"))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("不允许");
    }

    private BizOrder order(Long id, String status) {
        BizOrder order = new BizOrder();
        order.setOrderId(id);
        order.setOrderNo("SO20260101000000001");
        order.setCustomerName("测试客户");
        order.setAmount(new BigDecimal("10.00"));
        order.setStatus(status);
        return order;
    }
}
