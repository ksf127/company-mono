package com.company.mono.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 登录日志。status：0 成功 / 1 失败。
 */
@Data
@TableName("sys_login_log")
public class SysLoginLog {

    @TableId(value = "info_id", type = IdType.AUTO)
    private Long infoId;

    private String userName;

    private String ipaddr;

    private String browser;

    private String os;

    private String status;

    private String msg;

    private LocalDateTime loginTime;
}
