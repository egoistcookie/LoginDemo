package com.logindemo.model.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 审计日志查询请求DTO
 */
@Data
public class AuditLogQueryRequest {
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 用户名（模糊查询）
     */
    private String username;
    
    /**
     * 操作类型
     */
    private String operationType;
    
    /**
     * 状态：SUCCESS, FAILURE
     */
    private String status;
    
    /**
     * 开始时间
     */
    private LocalDateTime startTime;
    
    /**
     * 结束时间
     */
    private LocalDateTime endTime;
    
    /**
     * 页码（从1开始）
     */
    private Integer page = 1;
    
    /**
     * 每页数量
     */
    private Integer pageSize = 10;
}

