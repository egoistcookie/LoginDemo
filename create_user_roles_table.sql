-- 创建用户角色关联表
USE login_demo;

CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    created_at DATETIME NOT NULL DEFAULT NOW() COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_role (user_id, role_id) COMMENT '用户角色唯一约束'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 创建索引
CREATE INDEX idx_user_id ON user_roles(user_id);
CREATE INDEX idx_role_id ON user_roles(role_id);

-- 为测试用户分配USER角色
INSERT INTO user_roles (user_id, role_id, created_at) 
SELECT u.id, r.id, NOW() 
FROM users u, roles r 
WHERE u.username = 'testuser' AND r.name = 'USER';