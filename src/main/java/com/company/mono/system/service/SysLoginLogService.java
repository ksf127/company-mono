package com.company.mono.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.mono.common.api.PageResult;
import com.company.mono.system.entity.SysLoginLog;
import com.company.mono.system.mapper.SysLoginLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 登录日志：只分页查询，写入由 AuthService 负责。
 */
@Service
@RequiredArgsConstructor
public class SysLoginLogService {

    private final SysLoginLogMapper loginLogMapper;

    public PageResult<SysLoginLog> page(int pageNum, int pageSize, String keyword) {
        var wrapper = Wrappers.<SysLoginLog>lambdaQuery();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(SysLoginLog::getUserName, keyword);
        }
        wrapper.orderByDesc(SysLoginLog::getLoginTime);
        return PageResult.of(loginLogMapper.selectPage(Page.of(Math.max(pageNum, 1), normalizeSize(pageSize)), wrapper));
    }

    private int normalizeSize(int pageSize) {
        return Math.min(Math.max(pageSize, 1), 100);
    }
}
