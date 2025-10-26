package com.logindemo.service;

import com.logindemo.model.User;
import com.logindemo.model.dto.AuthResponse;
import com.logindemo.model.dto.LoginRequest;
import com.logindemo.model.dto.RegisterRequest;

/**
 * 用户服务接口
 */
public interface UserService {
    
    /**
     * 用户注册
     */
    AuthResponse register(RegisterRequest request);
    
    /**
     * 用户登录
     */
    AuthResponse login(LoginRequest request);
    
    /**
     * 用户登出
     */
    void logout(String token);
    
    /**
     * 刷新Token
     */
    AuthResponse refreshToken(String refreshToken);
    
    /**
     * 根据ID获取用户
     */
    User getUserById(Long id);
    
    /**
     * 根据用户名获取用户
     */
    User getUserByUsername(String username);
    
    /**
     * 验证Token
     */
    boolean validateToken(String token);
}