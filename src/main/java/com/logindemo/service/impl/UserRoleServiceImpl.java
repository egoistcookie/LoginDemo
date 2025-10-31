package com.logindemo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.logindemo.mapper.UserRoleMapper;
import com.logindemo.model.UserRole;
import com.logindemo.service.UserRoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * 用户角色关联服务实现类
 */
@Service
public class UserRoleServiceImpl extends ServiceImpl<UserRoleMapper, UserRole> implements UserRoleService {
    
    @Override
    public List<Long> getRoleIdsByUserId(Long userId) {
        return baseMapper.selectRoleIdsByUserId(userId);
    }
    
    @Override
    @Transactional
    public boolean assignRolesToUser(Long userId, List<Long> roleIds) {
        // 先删除用户原有的角色关联
        baseMapper.deleteByUserId(userId);
        
        // 如果有新的角色ID，则批量插入
        if (roleIds != null && !roleIds.isEmpty()) {
            return baseMapper.insertBatch(userId, roleIds) > 0;
        }
        
        return true;
    }
    
    @Override
    public List<Long> getUserIdsByRoleId(Long roleId) {
        // 这里可以根据需要实现，暂时返回空列表
        return List.of();
    }
}