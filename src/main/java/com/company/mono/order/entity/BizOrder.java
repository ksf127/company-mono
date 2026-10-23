package com.company.mono.order.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 示例业务订单，用于演示新增业务模块的最小闭环。
 */
@Data
@TableName("biz_order")
public class BizOrder {

    @TableId(value = "order_id", type = IdType.AUTO)
    private Long orderId;

    private String orderNo;

    private String customerName;

    private BigDecimal amount;

    /**
     * CREATED / PAID / SHIPPED / COMPLETED / CANCELLED
     */
    private String status;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
