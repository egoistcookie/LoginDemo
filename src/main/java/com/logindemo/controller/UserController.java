package com.logindemo.controller;

import com.logindemo.model.User;
import com.logindemo.model.dto.ApiResponse;
import com.logindemo.model.dto.AuthResponse;
import com.logindemo.service.UserService;
import com.logindemo.service.UserRoleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/users")
@Tag(name = "用户相关接口")
public class UserController {

    @Autowired
    private UserService userService;
    
    // RoleService注入已移除，不再使用
    
    @Autowired
    private UserRoleService userRoleService;

    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/me")
    @Operation(summary = "获取当前登录用户信息")
    public ApiResponse<AuthResponse.UserInfo> getCurrentUser() {
        // 从安全上下文中获取当前认证用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // 查询用户信息
        User user = userService.getUserByUsername(username);
        
        // 构建用户信息响应
        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setEmail(user.getEmail());
        userInfo.setPhone(user.getPhone());
        
        return ApiResponse.success(userInfo);
    }
    
    /**
     * 获取所有用户列表
     */
    @GetMapping
    @Operation(summary = "获取所有用户列表")
    public ApiResponse<?> getAllUsers() {
        List<User> users = userService.getAllUsers();
        
        // 为每个用户添加角色信息
        List<Map<String, Object>> result = users.stream().map(user -> {
            Map<String, Object> userMap = userService.convertUserToMap(user);
            List<Long> roleIds = userRoleService.getRoleIdsByUserId(user.getId());
            userMap.put("roleIds", roleIds);
            return userMap;
        }).collect(Collectors.toList());
        
        return ApiResponse.success(result);
    }
    
    /**
     * 更新用户信息
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新用户信息")
    public ApiResponse<?> updateUser(@PathVariable Long id, @Valid @RequestBody User user) {
        user.setId(id);
        userService.updateUser(user);
        return ApiResponse.success();
    }
    
    /**
     * 添加用户
     */
    @PostMapping
    @Operation(summary = "添加用户")
    public ApiResponse<?> addUser(@Valid @RequestBody User user) {
        userService.addUser(user);
        return ApiResponse.success();
    }
    
    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除用户")
    public ApiResponse<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.success();
    }
    
    /**
     * 获取用户的角色ID列表
     */
    @GetMapping("/{userId}/roles")
    @Operation(summary = "获取用户的角色ID列表")
    public ApiResponse<List<Long>> getUserRoles(@PathVariable Long userId) {
        List<Long> roleIds = userRoleService.getRoleIdsByUserId(userId);
        return ApiResponse.success(roleIds);
    }
    
    /**
     * 为用户分配角色
     */
    @PostMapping("/{userId}/roles")
    @Operation(summary = "为用户分配角色")
    public ApiResponse<Boolean> assignRolesToUser(
            @PathVariable Long userId,
            @RequestBody RoleAssignmentRequest request) {
        boolean success = userRoleService.assignRolesToUser(userId, request.getRoleIds());
        return ApiResponse.success(success);
    }
    
    // 内部类，用于接收角色分配请求
    public static class RoleAssignmentRequest {
        private List<Long> roleIds;
        
        public List<Long> getRoleIds() {
            return roleIds;
        }
        
        public void setRoleIds(List<Long> roleIds) {
            this.roleIds = roleIds;
        }
    }
}