package com.logindemo.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 审计日志实体类
 */
@Data
@TableName("audit_logs")
public class AuditLog implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 操作类型：LOGIN, LOGOUT, REGISTER, PASSWORD_CHANGE, PASSWORD_RESET, USER_UPDATE, USER_DELETE, ROLE_ASSIGN等
     */
    private String operationType;
    
    /**
     * 操作描述
     */
    private String operationDesc;
    
    /**
     * IP地址
     */
    private String ipAddress;
    
    /**
     * 用户代理（User-Agent）
     */
    private String userAgent;
    
    /**
     * 操作状态：SUCCESS, FAILURE
     */
    private String status;
    
    /**
     * 错误信息（如果操作失败）
     */
    private String errorMessage;
    
    /**
     * 请求方法：GET, POST, PUT, DELETE等
     */
    private String requestMethod;
    
    /**
     * 请求路径
     */
    private String requestPath;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}

