package com.logindemo.model.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Email;

/**
 * 发送邮箱验证码请求DTO
 */
@Data
public class SendEmailCodeRequest {
    
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
}

