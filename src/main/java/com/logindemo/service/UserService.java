package com.logindemo.service;

import com.logindemo.model.User;
import com.logindemo.model.Menu;
import com.logindemo.model.dto.AuthResponse;
import com.logindemo.model.dto.LoginRequest;
import com.logindemo.model.dto.RegisterRequest;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

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
    
    /**
     * 将User对象转换为Map
     */
    Map<String, Object> convertUserToMap(User user);
    
    /**
     * 获取用户的菜单列表
     */
    List<Menu> getUserMenus(String username);
    
    /**
     * 更新用户密码
     */
    boolean updatePassword(Long userId, String newPassword);
    
    /**
     * 发送短信验证码
     */
    void sendSmsCode(String phone);
    
    /**
     * 手机验证码登录
     */
    AuthResponse loginByPhone(String phone, String code);
    
    /**
     * 获取微信登录二维码
     */
    com.logindemo.model.dto.WechatQrcodeResponse getWechatQrcode();
    
    /**
     * 查询微信扫码状态
     */
    com.logindemo.model.dto.WechatStatusResponse getWechatStatus(String ticket);
}