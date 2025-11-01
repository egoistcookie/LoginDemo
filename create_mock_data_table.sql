-- Mock挡板表 - 用于存储短信验证码和微信登录状态等模拟数据
USE login_demo;

-- 创建mock_data表
CREATE TABLE IF NOT EXISTS mock_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    data_type VARCHAR(50) NOT NULL COMMENT '数据类型：sms_code-短信验证码, wechat_qrcode-微信二维码',
    data_key VARCHAR(255) NOT NULL COMMENT '数据键：手机号或ticket',
    data_value VARCHAR(500) COMMENT '数据值：验证码或二维码URL',
    extra_data TEXT COMMENT '额外数据：JSON格式存储额外信息',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-有效, expired-过期, used-已使用',
    expire_time DATETIME COMMENT '过期时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_data_type_key (data_type, data_key),
    INDEX idx_status (status),
    INDEX idx_expire_time (expire_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Mock挡板数据表';

-- 插入示例数据（用于测试）
-- 短信验证码示例：手机号13800138000的验证码是123456（5分钟内有效）
INSERT INTO mock_data (data_type, data_key, data_value, status, expire_time) VALUES
('sms_code', '13800138000', '123456', 'active', DATE_ADD(NOW(), INTERVAL 5 MINUTE));

-- 微信登录二维码示例
INSERT INTO mock_data (data_type, data_key, data_value, extra_data, status, expire_time) VALUES
('wechat_qrcode', 'MOCK_TICKET_001', 'https://via.placeholder.com/200x200?text=WeChat+QRCode', '{"status":"waiting","userId":null}', 'active', DATE_ADD(NOW(), INTERVAL 2 MINUTE));

