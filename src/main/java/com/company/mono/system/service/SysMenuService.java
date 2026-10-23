package com.company.mono.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.company.mono.common.exception.BizException;
import com.company.mono.common.exception.ErrorCode;
import com.company.mono.system.dto.SysMenuRequest;
import com.company.mono.system.entity.SysMenu;
import com.company.mono.system.mapper.SysMenuMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 菜单管理：返回完整树，供前端侧边栏与菜单维护页使用。
 */
@Service
@RequiredArgsConstructor
public class SysMenuService {

    private static final long ROOT_ID = 0L;

    private final SysMenuMapper menuMapper;

    public List<SysMenu> tree() {
        List<SysMenu> all = menuMapper.selectList(Wrappers.<SysMenu>lambdaQuery()
                .orderByAsc(SysMenu::getParentId)
                .orderByAsc(SysMenu::getOrderNum));
        Map<Long, SysMenu> index = new LinkedHashMap<>();
        all.forEach(menu -> {
            menu.setChildren(new ArrayList<>());
            index.put(menu.getMenuId(), menu);
        });

        List<SysMenu> roots = new ArrayList<>();
        for (SysMenu menu : all) {
            SysMenu parent = index.get(menu.getParentId());
            if (menu.getParentId() == null || menu.getParentId() == ROOT_ID || parent == null) {
                roots.add(menu);
            } else {
                parent.getChildren().add(menu);
            }
        }
        return roots;
    }

    public SysMenu create(SysMenuRequest request) {
        SysMenu menu = new SysMenu();
        apply(menu, request);
        menuMapper.insert(menu);
        return menu;
    }

    public void update(Long menuId, SysMenuRequest request) {
        SysMenu menu = get(menuId);
        apply(menu, request);
        menuMapper.updateById(menu);
    }

    public void delete(Long menuId) {
        get(menuId);
        Long children = menuMapper.selectCount(Wrappers.<SysMenu>lambdaQuery().eq(SysMenu::getParentId, menuId));
        if (children != null && children > 0) {
            throw new BizException(ErrorCode.CONFLICT, "存在子菜单，请先删除子菜单");
        }
        menuMapper.deleteById(menuId);
    }

    private SysMenu get(Long menuId) {
        SysMenu menu = menuMapper.selectById(menuId);
        if (menu == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "菜单不存在");
        }
        return menu;
    }

    private void apply(SysMenu menu, SysMenuRequest request) {
        menu.setMenuName(request.menuName());
        menu.setParentId(request.parentId() == null ? ROOT_ID : request.parentId());
        menu.setOrderNum(request.orderNum() == null ? 0 : request.orderNum());
        menu.setPath(request.path());
        menu.setComponent(request.component());
        menu.setMenuType(request.menuType());
        menu.setPerms(request.perms());
        menu.setIcon(request.icon());
        menu.setStatus(StringUtils.hasText(request.status()) ? request.status() : "0");
    }
}
