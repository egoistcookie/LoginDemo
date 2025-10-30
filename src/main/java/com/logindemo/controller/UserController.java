package com.logindemo.controller;

import com.logindemo.model.User;
import com.logindemo.model.dto.ApiResponse;
import com.logindemo.model.dto.AuthResponse;
import com.logindemo.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/users")
@Tag(name = "用户相关接口")
public class UserController {

    @Autowired
    private UserService userService;

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
        return ApiResponse.success(userService.getAllUsers());
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
}