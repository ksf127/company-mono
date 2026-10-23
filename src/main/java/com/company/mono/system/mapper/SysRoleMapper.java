package com.company.mono.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.mono.system.entity.SysRole;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface SysRoleMapper extends BaseMapper<SysRole> {

    /**
     * 查询用户已分配的角色标识，用于登录返回与前端展示。
     */
    @Select("""
            SELECT r.role_key FROM sys_role r
            JOIN sys_user_role ur ON ur.role_id = r.role_id
            WHERE ur.user_id = #{userId} AND r.deleted = 0
            ORDER BY r.role_sort
            """)
    List<String> selectRoleKeysByUserId(@Param("userId") Long userId);

    /**
     * 查询用户已分配的角色 ID，编辑用户时回填。
     */
    @Select("SELECT role_id FROM sys_user_role WHERE user_id = #{userId} ORDER BY role_id")
    List<Long> selectRoleIdsByUserId(@Param("userId") Long userId);
}
