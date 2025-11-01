package com.logindemo.model.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

/**
 * 重置密码请求DTO
 */
@Data
public class ResetPasswordRequest {
    
    /**
     * 找回方式：email 或 phone
     */
    @NotBlank(message = "找回方式不能为空")
    private String type; // email 或 phone
    
    /**
     * 邮箱或手机号
     */
    @NotBlank(message = "邮箱或手机号不能为空")
    private String account;
    
    /**
     * 验证码
     */
    @NotBlank(message = "验证码不能为空")
    private String code;
    
    /**
     * 新密码（至少6位）
     */
    @NotBlank(message = "新密码不能为空")
    @Pattern(regexp = "^.{6,}$", message = "密码长度至少6位")
    private String newPassword;
}

