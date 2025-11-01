-- 添加审计日志菜单项
-- 使用方法：在数据库中执行此SQL脚本，添加审计日志菜单并分配给相应的角色

-- 插入审计日志菜单（作为"未完待续"（parent_id=10）的子菜单，排序号3）
-- 如果已有id为25的菜单，请先删除或修改id值
-- 如果数据库中有key_path字段而不是key字段，请将下面的`key`改为`key_path`

-- 方式1：使用INSERT ... ON DUPLICATE KEY UPDATE（如果key_path字段有唯一索引）
-- 注意：字段顺序必须与表结构一致：id, parent_id, name, key_path, icon, sort_order, created_at, updated_at, key, path, component, visible
INSERT INTO `menus` (`id`, `parent_id`, `name`, `key_path`, `icon`, `sort_order`, `created_at`, `updated_at`, `key`, `path`, `component`, `visible`) 
VALUES (25, 10, '审计日志', 'audit-logs', 'FileSearchOutlined', 3, NOW(), NOW(), 'audit-logs', '/audit-logs', NULL, 1)
ON DUPLICATE KEY UPDATE 
  `name` = '审计日志',
  `parent_id` = 10,
  `key_path` = 'audit-logs',
  `key` = 'audit-logs',
  `icon` = 'FileSearchOutlined',
  `sort_order` = 3,
  `updated_at` = NOW();

-- 方式2：如果上面的语句报错（可能是因为key_path冲突），使用以下方式（先检查是否存在，不存在则插入）
-- INSERT INTO `menus` (`parent_id`, `name`, `key_path`, `icon`, `sort_order`, `created_at`, `updated_at`, `key`, `path`, `component`, `visible`) 
-- SELECT 10, '审计日志', 'audit-logs', 'FileSearchOutlined', 3, NOW(), NOW(), 'audit-logs', '/audit-logs', NULL, 1
-- WHERE NOT EXISTS (SELECT 1 FROM `menus` WHERE `key_path` = 'audit-logs' OR `key` = 'audit-logs');

-- 将审计日志菜单分配给系统管理员角色（role_id=3，即SYSTEM角色）
-- 如果用户需要其他角色也能访问，请添加相应的role_menus记录
-- 注意：如果role_menus表有唯一索引(role_id, menu_id)，使用ON DUPLICATE KEY UPDATE；否则先检查是否存在
INSERT INTO `role_menus` (`role_id`, `menu_id`, `created_at`) 
SELECT 3, m.id, NOW() FROM `menus` m 
WHERE (m.`key` = 'audit-logs' OR m.`key_path` = 'audit-logs')
  AND NOT EXISTS (
    SELECT 1 FROM `role_menus` rm 
    WHERE rm.`role_id` = 3 AND rm.`menu_id` = m.id
  );

-- 如果需要将审计日志菜单也分配给管理员角色（role_id=2，即ADMIN角色），取消下面的注释
-- INSERT INTO `role_menus` (`role_id`, `menu_id`, `created_at`) 
-- SELECT 2, m.id, NOW() FROM `menus` m 
-- WHERE (m.`key` = 'audit-logs' OR m.`key_path` = 'audit-logs')
--   AND NOT EXISTS (
--     SELECT 1 FROM `role_menus` rm 
--     WHERE rm.`role_id` = 2 AND rm.`menu_id` = m.id
--   );

-- 查询验证（可选，用于确认菜单是否添加成功）
-- SELECT * FROM menus WHERE `key` = 'audit-logs' OR `key_path` = 'audit-logs';
-- SELECT rm.*, m.name as menu_name, r.name as role_name 
-- FROM role_menus rm 
-- JOIN menus m ON rm.menu_id = m.id 
-- JOIN roles r ON rm.role_id = r.id 
-- WHERE m.`key` = 'audit-logs' OR m.`key_path` = 'audit-logs';

