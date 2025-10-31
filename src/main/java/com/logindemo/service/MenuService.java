package com.logindemo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.logindemo.model.Menu;
import java.util.List;

/**
 * 菜单服务接口
 */
public interface MenuService extends IService<Menu> {
    
    /**
     * 查询所有菜单
     */
    List<Menu> listAllMenus();
    
    /**
     * 根据角色ID列表查询用户可访问的菜单
     */
    List<Menu> listMenusByRoleIds(List<Long> roleIds);
    
    /**
     * 获取用户菜单树（嵌套结构）
     */
    List<Menu> getUserMenuTree(List<Long> roleIds);
    
    /**
     * 保存菜单（新增或更新）
     */
    Menu saveMenu(Menu menu);
    
    /**
     * 删除菜单
     */
    void deleteMenu(Long id);
}