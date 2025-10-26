package com.logindemo.model.dto;

import lombok.Data;

/**
 * 认证响应DTO
 */
@Data
public class AuthResponse {
    
    private String accessToken;
    
    private String refreshToken;
    
    private Long expiresIn;
    
    private UserInfo user;
    
    /**
     * 用户信息内部类
     */
    @Data
    public static class UserInfo {
        private Long id;
        private String username;
        private String email;
        private String phone;
    }
}