package com.logindemo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.logindemo.model.RoleMenu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 角色菜单关联Mapper接口
 */
@Mapper
public interface RoleMenuMapper extends BaseMapper<RoleMenu> {
    
    /**
     * 根据角色ID查询菜单ID列表
     */
    List<Long> selectMenuIdsByRoleId(@Param("roleId") Long roleId);
    
    /**
     * 根据菜单ID查询角色ID列表
     */
    List<Long> selectRoleIdsByMenuId(@Param("menuId") Long menuId);
    
    /**
     * 批量插入角色菜单关联
     */
    int insertBatch(@Param("roleId") Long roleId, @Param("menuIds") List<Long> menuIds);
    
    /**
     * 根据角色ID删除所有关联
     */
    int deleteByRoleId(@Param("roleId") Long roleId);
}