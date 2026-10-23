package com.company.mono.system.controller;

import com.company.mono.common.api.ApiResult;
import com.company.mono.common.api.PageResult;
import com.company.mono.system.dto.SysDictDataRequest;
import com.company.mono.system.dto.SysDictTypeRequest;
import com.company.mono.system.entity.SysDictData;
import com.company.mono.system.entity.SysDictType;
import com.company.mono.system.service.SysDictService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 字典管理接口：类型与数据。
 */
@RestController
@RequestMapping("/api/system/dict")
@RequiredArgsConstructor
public class SysDictController {

    private final SysDictService dictService;

    @GetMapping("/types")
    public ApiResult<List<SysDictType>> types() {
        return ApiResult.ok(dictService.types());
    }

    @GetMapping("/types/page")
    public ApiResult<PageResult<SysDictType>> typePage(@RequestParam(defaultValue = "1") int pageNum,
                                                       @RequestParam(defaultValue = "10") int pageSize,
                                                       @RequestParam(required = false) String keyword) {
        return ApiResult.ok(dictService.pageTypes(pageNum, pageSize, keyword));
    }

    @PostMapping("/types")
    public ApiResult<SysDictType> createType(@Valid @RequestBody SysDictTypeRequest request) {
        return ApiResult.ok(dictService.createType(request));
    }

    @PutMapping("/types/{dictId}")
    public ApiResult<Void> updateType(@PathVariable Long dictId, @Valid @RequestBody SysDictTypeRequest request) {
        dictService.updateType(dictId, request);
        return ApiResult.ok();
    }

    @DeleteMapping("/types/{dictId}")
    public ApiResult<Void> deleteType(@PathVariable Long dictId) {
        dictService.deleteType(dictId);
        return ApiResult.ok();
    }

    @GetMapping("/data")
    public ApiResult<List<SysDictData>> data(@RequestParam String dictType) {
        return ApiResult.ok(dictService.data(dictType));
    }

    @PostMapping("/data")
    public ApiResult<SysDictData> createData(@Valid @RequestBody SysDictDataRequest request) {
        return ApiResult.ok(dictService.createData(request));
    }

    @PutMapping("/data/{dictCode}")
    public ApiResult<Void> updateData(@PathVariable Long dictCode, @Valid @RequestBody SysDictDataRequest request) {
        dictService.updateData(dictCode, request);
        return ApiResult.ok();
    }

    @DeleteMapping("/data/{dictCode}")
    public ApiResult<Void> deleteData(@PathVariable Long dictCode) {
        dictService.deleteData(dictCode);
        return ApiResult.ok();
    }
}
