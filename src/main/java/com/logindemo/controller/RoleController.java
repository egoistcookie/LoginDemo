package com.logindemo.controller;

import com.logindemo.model.Role;
import com.logindemo.model.dto.ApiResponse;
import com.logindemo.service.RoleService;
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
}