package com.logindemo.model.dto;

import lombok.Data;

/**
 * 微信登录状态响应DTO
 */
@Data
public class WechatStatusResponse {
    
    /**
     * 状态：waiting-等待扫码, scanned-已扫描, confirmed-已确认, expired-已过期
     */
    private String status;
    
    /**
     * 认证响应（仅在confirmed状态时返回）
     */
    private AuthResponse authResponse;
}

