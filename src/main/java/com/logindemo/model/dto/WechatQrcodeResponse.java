package com.logindemo.model.dto;

import lombok.Data;

/**
 * 微信二维码响应DTO
 */
@Data
public class WechatQrcodeResponse {
    
    /**
     * 二维码URL
     */
    private String qrcodeUrl;
    
    /**
     * 二维码票据（用于轮询状态）
     */
    private String ticket;
    
    /**
     * 过期时间（秒）
     */
    private Long expireSeconds;
}

