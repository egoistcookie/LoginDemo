package com.logindemo.aspect;

import com.logindemo.model.User;
import com.logindemo.service.AuditLogService;
import com.logindemo.service.UserService;
import com.logindemo.utils.HttpRequestUtils;
import com.logindemo.utils.OperationTypeUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

/**
 * 审计日志切面
 * 自动拦截所有Controller方法，记录审计日志
 */
@Aspect
@Component
@Order(1)
public class AuditLogAspect {
    
    private static final Logger logger = LoggerFactory.getLogger(AuditLogAspect.class);
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private HttpRequestUtils httpRequestUtils;
    
    @Autowired
    private OperationTypeUtils operationTypeUtils;
    
    @Autowired
    private UserService userService;
    
    /**
     * 拦截所有Controller方法
     * 排除审计日志查询接口，避免循环记录
     */
    @Around("execution(* com.logindemo.controller..*(..)) && " +
            "!execution(* com.logindemo.controller.AuditLogController.*(..))")
    public Object aroundController(ProceedingJoinPoint joinPoint) throws Throwable {
        // 获取请求信息
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            // 如果没有请求上下文，直接执行方法
            return joinPoint.proceed();
        }
        
        HttpServletRequest request = attributes.getRequest();
        String requestPath = request.getRequestURI();
        String requestMethod = request.getMethod();
        
        // 排除审计日志查询接口
        if (requestPath != null && requestPath.contains("/audit-logs")) {
            return joinPoint.proceed();
        }
        
        // 获取请求信息
        String ipAddress = httpRequestUtils.getClientIp();
        String userAgent = httpRequestUtils.getUserAgent();
        
        // 获取用户信息
        Long userId = null;
        String username = null;
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                authentication.getName() != null && !"anonymousUser".equals(authentication.getName())) {
                username = authentication.getName();
                try {
                    User user = userService.getUserByUsername(username);
                    if (user != null) {
                        userId = user.getId();
                    }
                } catch (Exception e) {
                    logger.debug("获取用户信息失败: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.debug("获取认证信息失败: {}", e.getMessage());
        }
        
        // 推断操作类型和描述
        String operationType = operationTypeUtils.inferOperationType(requestPath, requestMethod);
        String operationDesc = operationTypeUtils.generateOperationDesc(operationType, requestPath, requestMethod);
        
        // 执行方法并记录日志
        Object result = null;
        Throwable exception = null;
        try {
            result = joinPoint.proceed();
            // 记录成功日志
            recordAuditLog(operationType, operationDesc, userId, username, 
                          ipAddress, userAgent, requestMethod, requestPath, null);
            return result;
        } catch (Throwable e) {
            exception = e;
            // 记录失败日志
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.isEmpty()) {
                errorMessage = e.getClass().getSimpleName();
            }
            // 限制错误信息长度
            if (errorMessage.length() > 500) {
                errorMessage = errorMessage.substring(0, 500);
            }
            recordAuditLog(operationType, operationDesc, userId, username, 
                          ipAddress, userAgent, requestMethod, requestPath, errorMessage);
            throw e;
        }
    }
    
    /**
     * 记录审计日志
     * 使用独立线程异步记录，避免影响主业务性能
     */
    private void recordAuditLog(String operationType, String operationDesc, Long userId, String username,
                               String ipAddress, String userAgent, String requestMethod, String requestPath,
                               String errorMessage) {
        try {
            // 使用新线程异步记录，避免阻塞主业务
            new Thread(() -> {
                try {
                    if (errorMessage == null) {
                        // 成功操作
                        auditLogService.logSuccess(operationType, operationDesc, userId, username,
                                                  ipAddress, userAgent, requestMethod, requestPath);
                    } else {
                        // 失败操作
                        auditLogService.logFailure(operationType, operationDesc, userId, username,
                                                  ipAddress, userAgent, errorMessage,
                                                  requestMethod, requestPath);
                    }
                } catch (Exception e) {
                    // 审计日志记录失败不应该影响主业务，只记录错误日志
                    logger.error("记录审计日志失败: {}", e.getMessage(), e);
                }
            }).start();
        } catch (Exception e) {
            // 如果创建线程失败，直接记录错误日志
            logger.error("创建审计日志记录线程失败: {}", e.getMessage(), e);
        }
    }
}

