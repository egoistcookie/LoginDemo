package com.logindemo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.logindemo.mapper.RoleMenuMapper;
import com.logindemo.model.RoleMenu;
import com.logindemo.service.RoleMenuService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * 角色菜单关联服务实现类
 */
@Service
public class RoleMenuServiceImpl extends ServiceImpl<RoleMenuMapper, RoleMenu> implements RoleMenuService {
    
    @Override
    public List<Long> getMenuIdsByRoleId(Long roleId) {
        return baseMapper.selectMenuIdsByRoleId(roleId);
    }
    
    @Override
    @Transactional
    public boolean assignMenusToRole(Long roleId, List<Long> menuIds) {
        // 先删除角色原有的菜单关联
        baseMapper.deleteByRoleId(roleId);
        
        // 如果有新的菜单ID，则批量插入
        if (menuIds != null && !menuIds.isEmpty()) {
            return baseMapper.insertBatch(roleId, menuIds) > 0;
        }
        
        return true;
    }
    
    @Override
    public List<Long> getRoleIdsByMenuId(Long menuId) {
        return baseMapper.selectRoleIdsByMenuId(menuId);
    }
}