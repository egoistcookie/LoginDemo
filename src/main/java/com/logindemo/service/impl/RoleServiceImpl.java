package com.logindemo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.logindemo.mapper.RoleMapper;
import com.logindemo.model.Role;
import com.logindemo.service.RoleService;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 角色服务实现类
 */
@Service
public class RoleServiceImpl extends ServiceImpl<RoleMapper, Role> implements RoleService {
    
    @Override
    public List<Role> listAllRoles() {
        return baseMapper.selectList(null);
    }
    
    @Override
    public List<Role> listRolesByIds(List<Long> roleIds) {
        return baseMapper.selectBatchIds(roleIds);
    }
    
    @Override
    public Role saveRole(Role role) {
        // 如果ID不为空则更新，否则新增
        if (role.getId() != null) {
            this.updateById(role);
        } else {
            this.save(role);
        }
        return role;
    }
    
    @Override
    public void deleteRole(Long id) {
        this.removeById(id);
    }
}