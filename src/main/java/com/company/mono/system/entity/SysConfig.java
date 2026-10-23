package com.company.mono.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 参数配置。configType：Y 系统内置 / N 用户自定义。
 */
@Data
@TableName("sys_config")
public class SysConfig {

    @TableId(value = "config_id", type = IdType.AUTO)
    private Long configId;

    private String configName;

    private String configKey;

    private String configValue;

    private String configType;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
