package com.company.mono.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.mono.common.api.PageResult;
import com.company.mono.common.exception.BizException;
import com.company.mono.common.exception.ErrorCode;
import com.company.mono.system.dto.SysDictDataRequest;
import com.company.mono.system.dto.SysDictTypeRequest;
import com.company.mono.system.entity.SysDictData;
import com.company.mono.system.entity.SysDictType;
import com.company.mono.system.mapper.SysDictDataMapper;
import com.company.mono.system.mapper.SysDictTypeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 字典管理：字典类型与字典数据。
 */
@Service
@RequiredArgsConstructor
public class SysDictService {

    private final SysDictTypeMapper dictTypeMapper;
    private final SysDictDataMapper dictDataMapper;

    public List<SysDictType> types() {
        return dictTypeMapper.selectList(Wrappers.<SysDictType>lambdaQuery().orderByAsc(SysDictType::getDictId));
    }

    public PageResult<SysDictType> pageTypes(int pageNum, int pageSize, String keyword) {
        var wrapper = Wrappers.<SysDictType>lambdaQuery();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(SysDictType::getDictName, keyword).or().like(SysDictType::getDictType, keyword));
        }
        wrapper.orderByAsc(SysDictType::getDictId);
        return PageResult.of(dictTypeMapper.selectPage(Page.of(Math.max(pageNum, 1), normalizeSize(pageSize)), wrapper));
    }

    public SysDictType createType(SysDictTypeRequest request) {
        Long exists = dictTypeMapper.selectCount(Wrappers.<SysDictType>lambdaQuery()
                .eq(SysDictType::getDictType, request.dictType()));
        if (exists != null && exists > 0) {
            throw new BizException(ErrorCode.CONFLICT, "字典类型已存在");
        }
        SysDictType type = new SysDictType();
        applyType(type, request);
        dictTypeMapper.insert(type);
        return type;
    }

    public void updateType(Long dictId, SysDictTypeRequest request) {
        SysDictType type = dictTypeMapper.selectById(dictId);
        if (type == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "字典类型不存在");
        }
        applyType(type, request);
        dictTypeMapper.updateById(type);
    }

    /**
     * 删除字典类型时一并逻辑删除其下数据，避免留下孤儿数据。
     */
    @Transactional
    public void deleteType(Long dictId) {
        SysDictType type = dictTypeMapper.selectById(dictId);
        if (type == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "字典类型不存在");
        }
        dictTypeMapper.deleteById(dictId);
        dictDataMapper.delete(Wrappers.<SysDictData>lambdaQuery().eq(SysDictData::getDictType, type.getDictType()));
    }

    public List<SysDictData> data(String dictType) {
        return dictDataMapper.selectList(Wrappers.<SysDictData>lambdaQuery()
                .eq(SysDictData::getDictType, dictType)
                .orderByAsc(SysDictData::getDictSort));
    }

    public SysDictData createData(SysDictDataRequest request) {
        SysDictData data = new SysDictData();
        applyData(data, request);
        dictDataMapper.insert(data);
        return data;
    }

    public void updateData(Long dictCode, SysDictDataRequest request) {
        SysDictData data = dictDataMapper.selectById(dictCode);
        if (data == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "字典数据不存在");
        }
        applyData(data, request);
        dictDataMapper.updateById(data);
    }

    public void deleteData(Long dictCode) {
        if (dictDataMapper.selectById(dictCode) == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "字典数据不存在");
        }
        dictDataMapper.deleteById(dictCode);
    }

    private void applyType(SysDictType type, SysDictTypeRequest request) {
        type.setDictName(request.dictName());
        type.setDictType(request.dictType());
        type.setStatus(StringUtils.hasText(request.status()) ? request.status() : "0");
        type.setRemark(request.remark());
    }

    private void applyData(SysDictData data, SysDictDataRequest request) {
        data.setDictType(request.dictType());
        data.setDictLabel(request.dictLabel());
        data.setDictValue(request.dictValue());
        data.setDictSort(request.dictSort() == null ? 0 : request.dictSort());
        data.setListClass(request.listClass());
        data.setIsDefault(StringUtils.hasText(request.isDefault()) ? request.isDefault() : "0");
        data.setStatus(StringUtils.hasText(request.status()) ? request.status() : "0");
        data.setRemark(request.remark());
    }

    private int normalizeSize(int pageSize) {
        return Math.min(Math.max(pageSize, 1), 100);
    }
}
