
-- 删除已存在的表
DROP TABLE IF EXISTS `users`;

-- 创建用户表
CREATE TABLE `users` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username` VARCHAR(20) NOT NULL COMMENT '用户名，唯一，3-20位字母数字下划线',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（明文存储，仅示例）',
    `phone` VARCHAR(11) NOT NULL COMMENT '手机号，唯一，11位数字',
    `nickname` VARCHAR(255) DEFAULT NULL COMMENT '昵称',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `intro` VARCHAR(255) DEFAULT NULL COMMENT '个人简介',
    `role` VARCHAR(20) NOT NULL DEFAULT 'STUDENT' COMMENT '角色：STUDENT / ADMIN',
    `locked` INT(11) NOT NULL DEFAULT 0 COMMENT '锁定状态：0正常，1锁定',
    `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
    `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';


INSERT INTO `users` (`username`, `password`, `phone`, `nickname`, `avatar`, `intro`, `role`, `locked`, `create_time`, `update_time`) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '11111111111', 'admin', NULL, '协助管理平台', 'ADMIN', 0, NOW(), NOW()),
('student', 'e10adc3949ba59abbe56e057f20f883e', '22222222222', 'student', NULL, '热爱算法的学生', 'STUDENT', 0, NOW(), NOW());

