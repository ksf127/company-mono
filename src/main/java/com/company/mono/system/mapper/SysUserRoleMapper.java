package com.company.mono.system.mapper;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户-角色关联表没有独立主键，直接用注解 SQL 维护，避免为中间表造实体。
 */
public interface SysUserRoleMapper {

    @Delete("DELETE FROM sys_user_role WHERE user_id = #{userId}")
    int deleteByUserId(@Param("userId") Long userId);

    @Insert("""
            <script>
            INSERT INTO sys_user_role(user_id, role_id) VALUES
            <foreach collection="roleIds" item="roleId" separator=",">
                (#{userId}, #{roleId})
            </foreach>
            </script>
            """)
    int insertBatch(@Param("userId") Long userId, @Param("roleIds") List<Long> roleIds);
}
