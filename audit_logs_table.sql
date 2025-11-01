-- 审计日志表
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT(20) DEFAULT NULL COMMENT '用户ID',
  `username` VARCHAR(50) DEFAULT NULL COMMENT '用户名',
  `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型：LOGIN, LOGOUT, REGISTER, PASSWORD_CHANGE, PASSWORD_RESET, USER_UPDATE, USER_DELETE, ROLE_ASSIGN等',
  `operation_desc` VARCHAR(255) DEFAULT NULL COMMENT '操作描述',
  `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户代理（User-Agent）',
  `status` VARCHAR(20) NOT NULL COMMENT '操作状态：SUCCESS, FAILURE',
  `error_message` VARCHAR(500) DEFAULT NULL COMMENT '错误信息（如果操作失败）',
  `request_method` VARCHAR(10) DEFAULT NULL COMMENT '请求方法：GET, POST, PUT, DELETE等',
  `request_path` VARCHAR(255) DEFAULT NULL COMMENT '请求路径',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_username` (`username`),
  KEY `idx_operation_type` (`operation_type`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计日志表';

