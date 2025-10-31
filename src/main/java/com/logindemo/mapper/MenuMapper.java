package com.logindemo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.logindemo.model.Menu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 菜单Mapper接口
 */
@Mapper
public interface MenuMapper extends BaseMapper<Menu> {
    
    /**
     * 根据角色ID列表查询用户可访问的菜单
     */
    List<Menu> selectMenusByRoleIds(@Param("roleIds") List<Long> roleIds);
    
    /**
     * 获取所有顶级菜单
     */
    List<Menu> selectTopMenus();
    
    /**
     * 根据父菜单ID获取子菜单
     */
    List<Menu> selectChildrenByParentId(@Param("parentId") Long parentId);
}