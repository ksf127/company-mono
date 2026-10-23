package com.company.mono.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.mono.common.api.PageResult;
import com.company.mono.common.exception.BizException;
import com.company.mono.common.exception.ErrorCode;
import com.company.mono.system.dto.SysConfigRequest;
import com.company.mono.system.entity.SysConfig;
import com.company.mono.system.mapper.SysConfigMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 参数配置：列表查询与更新。
 */
@Service
@RequiredArgsConstructor
public class SysConfigService {

    private final SysConfigMapper configMapper;

    public PageResult<SysConfig> page(int pageNum, int pageSize, String keyword) {
        var wrapper = Wrappers.<SysConfig>lambdaQuery();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(SysConfig::getConfigName, keyword).or().like(SysConfig::getConfigKey, keyword));
        }
        wrapper.orderByAsc(SysConfig::getConfigId);
        return PageResult.of(configMapper.selectPage(Page.of(Math.max(pageNum, 1), normalizeSize(pageSize)), wrapper));
    }

    public void update(Long configId, SysConfigRequest request) {
        SysConfig config = configMapper.selectById(configId);
        if (config == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "参数不存在");
        }
        config.setConfigName(request.configName());
        config.setConfigValue(request.configValue());
        config.setRemark(request.remark());
        configMapper.updateById(config);
    }

    private int normalizeSize(int pageSize) {
        return Math.min(Math.max(pageSize, 1), 100);
    }
}
