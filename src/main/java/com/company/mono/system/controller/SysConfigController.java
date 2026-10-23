package com.company.mono.system.controller;

import com.company.mono.common.api.ApiResult;
import com.company.mono.common.api.PageResult;
import com.company.mono.system.dto.SysConfigRequest;
import com.company.mono.system.entity.SysConfig;
import com.company.mono.system.service.SysConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 参数配置接口：列表与更新。
 */
@RestController
@RequestMapping("/api/system/configs")
@RequiredArgsConstructor
public class SysConfigController {

    private final SysConfigService configService;

    @GetMapping("/page")
    public ApiResult<PageResult<SysConfig>> page(@RequestParam(defaultValue = "1") int pageNum,
                                                 @RequestParam(defaultValue = "10") int pageSize,
                                                 @RequestParam(required = false) String keyword) {
        return ApiResult.ok(configService.page(pageNum, pageSize, keyword));
    }

    @PutMapping("/{configId}")
    public ApiResult<Void> update(@PathVariable Long configId, @Valid @RequestBody SysConfigRequest request) {
        configService.update(configId, request);
        return ApiResult.ok();
    }
}
