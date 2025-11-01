package com.logindemo.model.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

/**
 * 登录请求DTO
 */
@Data
public class LoginRequest {
    
    @NotBlank(message = "用户名不能为空")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    private String password;
    
    private Boolean rememberMe = false;
    
    /**
     * 验证码Key（当需要验证码时）
     */
    private String captchaKey;
    
    /**
     * 验证码值（当需要验证码时）
     */
    private String captchaCode;
}