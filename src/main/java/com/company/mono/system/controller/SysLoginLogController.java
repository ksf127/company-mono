package com.company.mono.system.controller;

import com.company.mono.common.api.ApiResult;
import com.company.mono.common.api.PageResult;
import com.company.mono.system.entity.SysLoginLog;
import com.company.mono.system.service.SysLoginLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 登录日志接口，只读。
 */
@RestController
@RequestMapping("/api/system/login-logs")
@RequiredArgsConstructor
public class SysLoginLogController {

    private final SysLoginLogService loginLogService;

    @GetMapping("/page")
    public ApiResult<PageResult<SysLoginLog>> page(@RequestParam(defaultValue = "1") int pageNum,
                                                   @RequestParam(defaultValue = "10") int pageSize,
                                                   @RequestParam(required = false) String keyword) {
        return ApiResult.ok(loginLogService.page(pageNum, pageSize, keyword));
    }
}
