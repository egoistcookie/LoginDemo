package com.logindemo.controller;

import com.logindemo.model.Role;
import com.logindemo.model.dto.ApiResponse;
import com.logindemo.service.RoleService;
import com.logindemo.service.RoleMenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 角色控制器
 */
@RestController
@RequestMapping("/roles")
public class RoleController {
    
    @Autowired
    private RoleService roleService;
    
    @Autowired
    private RoleMenuService roleMenuService;
    
    /**
     * 获取所有角色
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Role>>> listAllRoles() {
        List<Role> roles = roleService.listAllRoles();
        return ResponseEntity.ok(ApiResponse.success(roles));
    }
    
    /**
     * 添加新角色
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Role>> createRole(@RequestBody Role role) {
        Role createdRole = roleService.saveRole(role);
        return ResponseEntity.ok(ApiResponse.success(createdRole));
    }
    
    /**
     * 更新角色
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Role>> updateRole(@PathVariable Long id, @RequestBody Role role) {
        role.setId(id);
        Role updatedRole = roleService.saveRole(role);
        return ResponseEntity.ok(ApiResponse.success(updatedRole));
    }
    
    /**
     * 删除角色
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    /**
     * 获取角色的菜单权限列表
     */
    @GetMapping("/{roleId}/menus")
    public ResponseEntity<ApiResponse<List<Long>>> getRoleMenus(@PathVariable Long roleId) {
        List<Long> menuIds = roleMenuService.getMenuIdsByRoleId(roleId);
        return ResponseEntity.ok(ApiResponse.success(menuIds));
    }
    
    /**
     * 为角色配置菜单权限
     */
    @PutMapping("/{roleId}/menus")
    public ResponseEntity<ApiResponse<Boolean>> assignMenusToRole(@PathVariable Long roleId, @RequestBody List<Long> menuIds) {
        boolean success = roleMenuService.assignMenusToRole(roleId, menuIds);
        return ResponseEntity.ok(ApiResponse.success(success));
    }
}