package com.company.mono.common.api;

import com.baomidou.mybatisplus.core.metadata.IPage;

import java.util.List;

/**
 * 分页统一返回：total 为总条数，rows 为当前页数据。
 */
public record PageResult<T>(long total, List<T> rows) {

    public static <T> PageResult<T> of(IPage<T> page) {
        return new PageResult<>(page.getTotal(), page.getRecords());
    }
}
