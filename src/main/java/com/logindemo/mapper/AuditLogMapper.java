package com.logindemo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.logindemo.model.AuditLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 审计日志Mapper接口
 */
@Mapper
public interface AuditLogMapper extends BaseMapper<AuditLog> {
    
    /**
     * 根据条件查询审计日志
     */
    List<AuditLog> selectAuditLogs(
        @Param("userId") Long userId,
        @Param("username") String username,
        @Param("operationType") String operationType,
        @Param("status") String status,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("offset") Integer offset,
        @Param("limit") Integer limit
    );
    
    /**
     * 统计符合条件的审计日志数量
     */
    Long countAuditLogs(
        @Param("userId") Long userId,
        @Param("username") String username,
        @Param("operationType") String operationType,
        @Param("status") String status,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}

