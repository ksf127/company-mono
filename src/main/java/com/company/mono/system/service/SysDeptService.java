package com.company.mono.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.company.mono.common.exception.BizException;
import com.company.mono.common.exception.ErrorCode;
import com.company.mono.system.dto.SysDeptRequest;
import com.company.mono.system.entity.SysDept;
import com.company.mono.system.mapper.SysDeptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 部门管理：树形查询与增删改。
 */
@Service
@RequiredArgsConstructor
public class SysDeptService {

    private static final long ROOT_ID = 0L;

    private final SysDeptMapper deptMapper;

    public List<SysDept> tree() {
        List<SysDept> all = deptMapper.selectList(Wrappers.<SysDept>lambdaQuery()
                .orderByAsc(SysDept::getParentId)
                .orderByAsc(SysDept::getOrderNum));
        Map<Long, SysDept> index = new LinkedHashMap<>();
        all.forEach(dept -> {
            dept.setChildren(new ArrayList<>());
            index.put(dept.getDeptId(), dept);
        });

        List<SysDept> roots = new ArrayList<>();
        for (SysDept dept : all) {
            SysDept parent = index.get(dept.getParentId());
            if (dept.getParentId() == null || dept.getParentId() == ROOT_ID || parent == null) {
                roots.add(dept);
            } else {
                parent.getChildren().add(dept);
            }
        }
        return roots;
    }

    public SysDept create(SysDeptRequest request) {
        SysDept dept = new SysDept();
        apply(dept, request);
        deptMapper.insert(dept);
        return dept;
    }

    public void update(Long deptId, SysDeptRequest request) {
        SysDept dept = get(deptId);
        apply(dept, request);
        deptMapper.updateById(dept);
    }

    public void delete(Long deptId) {
        get(deptId);
        Long children = deptMapper.selectCount(Wrappers.<SysDept>lambdaQuery().eq(SysDept::getParentId, deptId));
        if (children != null && children > 0) {
            throw new BizException(ErrorCode.CONFLICT, "存在下级部门，请先删除下级部门");
        }
        deptMapper.deleteById(deptId);
    }

    private SysDept get(Long deptId) {
        SysDept dept = deptMapper.selectById(deptId);
        if (dept == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "部门不存在");
        }
        return dept;
    }

    private void apply(SysDept dept, SysDeptRequest request) {
        dept.setDeptName(request.deptName());
        dept.setParentId(request.parentId() == null ? ROOT_ID : request.parentId());
        dept.setOrderNum(request.orderNum() == null ? 0 : request.orderNum());
        dept.setLeader(request.leader());
        dept.setPhone(request.phone());
        dept.setEmail(request.email());
        dept.setStatus(StringUtils.hasText(request.status()) ? request.status() : "0");
    }
}
