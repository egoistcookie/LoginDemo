package com.logindemo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.logindemo.model.UserRole;
import java.util.List;

/**
 * 用户角色关联服务接口
 */
public interface UserRoleService extends IService<UserRole> {
    
    /**
     * 根据用户ID查询角色ID列表
     */
    List<Long> getRoleIdsByUserId(Long userId);
    
    /**
     * 为用户分配角色
     */
    boolean assignRolesToUser(Long userId, List<Long> roleIds);
    
    /**
     * 根据角色ID查询用户ID列表
     */
    List<Long> getUserIdsByRoleId(Long roleId);
}