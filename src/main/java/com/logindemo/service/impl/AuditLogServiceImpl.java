package com.logindemo.service.impl;

import com.logindemo.mapper.AuditLogMapper;
import com.logindemo.model.AuditLog;
import com.logindemo.service.AuditLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 审计日志服务实现类
 */
@Service
public class AuditLogServiceImpl implements AuditLogService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuditLogServiceImpl.class);
    
    @Autowired
    private AuditLogMapper auditLogMapper;
    
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String operationType, String operationDesc, Long userId, String username,
                    String ipAddress, String userAgent, String status, String errorMessage,
                    String requestMethod, String requestPath) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setUserId(userId);
            auditLog.setUsername(username);
            auditLog.setOperationType(operationType);
            auditLog.setOperationDesc(operationDesc);
            auditLog.setIpAddress(ipAddress);
            auditLog.setUserAgent(userAgent);
            auditLog.setStatus(status);
            auditLog.setErrorMessage(errorMessage);
            auditLog.setRequestMethod(requestMethod);
            auditLog.setRequestPath(requestPath);
            auditLog.setCreatedAt(LocalDateTime.now());
            
            auditLogMapper.insert(auditLog);
            logger.debug("审计日志已记录: {} - {} - {}", operationType, username, status);
        } catch (Exception e) {
            // 审计日志记录失败不应该影响主业务，只记录错误日志
            logger.error("记录审计日志失败", e);
        }
    }
    
    @Override
    public void logSuccess(String operationType, String operationDesc, Long userId, String username,
                          String ipAddress, String userAgent, String requestMethod, String requestPath) {
        log(operationType, operationDesc, userId, username, ipAddress, userAgent, 
            "SUCCESS", null, requestMethod, requestPath);
    }
    
    @Override
    public void logFailure(String operationType, String operationDesc, Long userId, String username,
                          String ipAddress, String userAgent, String errorMessage,
                          String requestMethod, String requestPath) {
        log(operationType, operationDesc, userId, username, ipAddress, userAgent, 
            "FAILURE", errorMessage, requestMethod, requestPath);
    }
    
    @Override
    public List<AuditLog> getAuditLogs(Long userId, String username, String operationType,
                                      String status, LocalDateTime startTime, LocalDateTime endTime,
                                      Integer page, Integer pageSize) {
        if (page == null || page < 1) {
            page = 1;
        }
        if (pageSize == null || pageSize < 1) {
            pageSize = 10;
        }
        int offset = (page - 1) * pageSize;
        
        return auditLogMapper.selectAuditLogs(userId, username, operationType, status,
                                              startTime, endTime, offset, pageSize);
    }
    
    @Override
    public Long countAuditLogs(Long userId, String username, String operationType,
                               String status, LocalDateTime startTime, LocalDateTime endTime) {
        return auditLogMapper.countAuditLogs(userId, username, operationType, status,
                                            startTime, endTime);
    }
}

