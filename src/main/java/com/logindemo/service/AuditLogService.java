package com.logindemo.service;

import com.logindemo.model.AuditLog;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 审计日志服务接口
 */
public interface AuditLogService {
    
    /**
     * 记录审计日志
     */
    void log(String operationType, String operationDesc, Long userId, String username, 
             String ipAddress, String userAgent, String status, String errorMessage,
             String requestMethod, String requestPath);
    
    /**
     * 记录成功操作
     */
    void logSuccess(String operationType, String operationDesc, Long userId, String username,
                   String ipAddress, String userAgent, String requestMethod, String requestPath);
    
    /**
     * 记录失败操作
     */
    void logFailure(String operationType, String operationDesc, Long userId, String username,
                   String ipAddress, String userAgent, String errorMessage,
                   String requestMethod, String requestPath);
    
    /**
     * 查询审计日志
     */
    List<AuditLog> getAuditLogs(Long userId, String username, String operationType, 
                                String status, LocalDateTime startTime, LocalDateTime endTime,
                                Integer page, Integer pageSize);
    
    /**
     * 统计审计日志数量
     */
    Long countAuditLogs(Long userId, String username, String operationType, 
                       String status, LocalDateTime startTime, LocalDateTime endTime);
}

