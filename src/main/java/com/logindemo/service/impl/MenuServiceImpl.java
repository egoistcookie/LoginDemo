package com.logindemo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.logindemo.mapper.MenuMapper;
import com.logindemo.model.Menu;
import com.logindemo.service.MenuService;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 菜单服务实现类
 */
@Service
public class MenuServiceImpl extends ServiceImpl<MenuMapper, Menu> implements MenuService {
    
    @Override
    public List<Menu> listAllMenus() {
        return baseMapper.selectList(null);
    }
    
    @Override
    public List<Menu> listMenusByRoleIds(List<Long> roleIds) {
        return baseMapper.selectMenusByRoleIds(roleIds);
    }
    
    @Override
    public List<Menu> getUserMenuTree(List<Long> roleIds) {
        // 获取用户可访问的所有菜单
        List<Menu> menus = baseMapper.selectMenusByRoleIds(roleIds);
        
        // 构建菜单树
        return buildMenuTree(menus);
    }
    
    @Override
    public Menu saveMenu(Menu menu) {
        // 如果keyPath为空，自动生成
        if (menu.getKeyPath() == null || menu.getKeyPath().isEmpty()) {
            menu.setKeyPath(generateKeyPath(menu));
        }
        
        if (menu.getId() != null) {
            this.updateById(menu);
        } else {
            this.save(menu);
        }
        return menu;
    }
    
    /**
     * 自动生成keyPath
     * 如果是顶级菜单，keyPath = key
     * 如果有父菜单，keyPath = 父菜单的keyPath + "." + key
     */
    private String generateKeyPath(Menu menu) {
        if (menu.getKey() == null || menu.getKey().isEmpty()) {
            throw new IllegalArgumentException("菜单key不能为空");
        }
        
        // 顶级菜单
        if (menu.getParentId() == null || menu.getParentId() == 0) {
            return menu.getKey();
        }
        
        // 查询父菜单
        Menu parentMenu = this.getById(menu.getParentId());
        if (parentMenu == null) {
            // 如果父菜单不存在，只返回当前key
            return menu.getKey();
        }
        
        // 父菜单的keyPath + "." + 当前key
        String parentKeyPath = parentMenu.getKeyPath();
        if (parentKeyPath == null || parentKeyPath.isEmpty()) {
            // 如果父菜单也没有keyPath，递归生成
            parentKeyPath = generateKeyPath(parentMenu);
        }
        return parentKeyPath + "." + menu.getKey();
    }
    
    @Override
    public void deleteMenu(Long id) {
        this.removeById(id);
    }
    
    /**
     * 构建菜单树结构
     */
    private List<Menu> buildMenuTree(List<Menu> menus) {
        // 按父ID分组
        Map<Long, List<Menu>> menuMap = menus.stream()
                .collect(Collectors.groupingBy(Menu::getParentId));
        
        // 构建树结构
        List<Menu> rootMenus = new ArrayList<>();
        
        for (Menu menu : menus) {
            // 顶级菜单
            if (menu.getParentId() == 0) {
                rootMenus.add(menu);
                // 递归添加子菜单
                addChildMenus(menu, menuMap);
            }
        }
        
        // 按排序号排序
        rootMenus.sort(Comparator.comparing(Menu::getSortOrder).thenComparing(Menu::getId));
        
        return rootMenus;
    }
    
    /**
     * 递归添加子菜单
     */
    private void addChildMenus(Menu parentMenu, Map<Long, List<Menu>> menuMap) {
        List<Menu> children = menuMap.get(parentMenu.getId());
        if (children != null && !children.isEmpty()) {
            // 按排序号排序
            children.sort(Comparator.comparing(Menu::getSortOrder).thenComparing(Menu::getId));
            
            parentMenu.setChildren(children);
            
            // 递归处理子菜单
            for (Menu child : children) {
                addChildMenus(child, menuMap);
            }
        }
    }
}