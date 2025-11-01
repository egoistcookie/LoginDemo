package com.logindemo.controller;

import com.logindemo.model.AuditLog;
import com.logindemo.model.dto.ApiResponse;
import com.logindemo.model.dto.AuditLogQueryRequest;
import com.logindemo.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 审计日志控制器
 */
@RestController
@RequestMapping("/audit-logs")
@Tag(name = "审计日志相关接口")
public class AuditLogController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuditLogController.class);
    
    @Autowired
    private AuditLogService auditLogService;
    
    /**
     * 查询审计日志
     */
    @PostMapping("/query")
    @Operation(summary = "查询审计日志")
    public ApiResponse<Map<String, Object>> queryAuditLogs(@RequestBody AuditLogQueryRequest request) {
        logger.info("查询审计日志，条件: {}", request);
        try {
            List<AuditLog> logs = auditLogService.getAuditLogs(
                request.getUserId(),
                request.getUsername(),
                request.getOperationType(),
                request.getStatus(),
                request.getStartTime(),
                request.getEndTime(),
                request.getPage(),
                request.getPageSize()
            );
            
            Long total = auditLogService.countAuditLogs(
                request.getUserId(),
                request.getUsername(),
                request.getOperationType(),
                request.getStatus(),
                request.getStartTime(),
                request.getEndTime()
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("list", logs);
            result.put("total", total);
            result.put("page", request.getPage());
            result.put("pageSize", request.getPageSize());
            
            return ApiResponse.success(result);
        } catch (Exception e) {
            logger.error("查询审计日志失败", e);
            throw e;
        }
    }
    
    /**
     * 获取操作类型列表
     */
    @GetMapping("/operation-types")
    @Operation(summary = "获取操作类型列表")
    public ApiResponse<List<String>> getOperationTypes() {
        List<String> types = List.of(
            "LOGIN", "LOGOUT", "REGISTER", 
            "PASSWORD_CHANGE", "PASSWORD_RESET",
            "USER_UPDATE", "USER_DELETE", "USER_ADD",
            "ROLE_ASSIGN", "ROLE_REVOKE"
        );
        return ApiResponse.success(types);
    }
}

