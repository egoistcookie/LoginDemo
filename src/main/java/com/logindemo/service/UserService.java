package com.logindemo.service;

import com.logindemo.model.User;
import com.logindemo.model.dto.AuthResponse;
import com.logindemo.model.dto.LoginRequest;
import com.logindemo.model.dto.RegisterRequest;
import java.util.List;

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
    
    /**
     * 获取所有用户列表
     */
    List<User> getAllUsers();
    
    /**
     * 更新用户信息
     */
    boolean updateUser(User user);
    
    /**
     * 添加用户
     */
    boolean addUser(User user);
    
    /**
     * 删除用户
     */
    boolean deleteUser(Long id);
}