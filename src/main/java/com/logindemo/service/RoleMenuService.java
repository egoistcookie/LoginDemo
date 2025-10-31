package com.logindemo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.logindemo.model.RoleMenu;
import java.util.List;

/**
 * 角色菜单关联服务接口
 */
public interface RoleMenuService extends IService<RoleMenu> {
    
    /**
     * 根据角色ID查询菜单ID列表
     */
    List<Long> getMenuIdsByRoleId(Long roleId);
    
    /**
     * 为角色分配菜单
     */
    boolean assignMenusToRole(Long roleId, List<Long> menuIds);
    
    /**
     * 根据菜单ID查询角色ID列表
     */
    List<Long> getRoleIdsByMenuId(Long menuId);
}