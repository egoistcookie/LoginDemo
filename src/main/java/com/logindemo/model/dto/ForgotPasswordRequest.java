package com.logindemo.model.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

/**
 * 密码找回请求DTO
 */
@Data
public class ForgotPasswordRequest {
    
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
}

