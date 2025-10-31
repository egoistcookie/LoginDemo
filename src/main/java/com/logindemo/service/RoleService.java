package com.logindemo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.logindemo.model.Role;
import java.util.List;

/**
 * 角色服务接口
 */
public interface RoleService extends IService<Role> {
    
    /**
     * 查询所有角色
     */
    List<Role> listAllRoles();
    
    /**
     * 根据角色ID列表查询角色
     */
    List<Role> listRolesByIds(List<Long> roleIds);
    
    /**
     * 保存角色（新增或更新）
     */
    Role saveRole(Role role);
    
    /**
     * 删除角色
     */
    void deleteRole(Long id);
}