package com.company.mono.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 字典类型，例如 sys_normal_disable。
 */
@Data
@TableName("sys_dict_type")
public class SysDictType {

    @TableId(value = "dict_id", type = IdType.AUTO)
    private Long dictId;

    private String dictName;

    private String dictType;

    private String status;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
