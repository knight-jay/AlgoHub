
-- 删除已存在的表
DROP TABLE IF EXISTS `resources`;
DROP TABLE IF EXISTS `resource_categories`;

-- 创建资源分类表
CREATE TABLE `resource_categories` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `sort_order` INT DEFAULT 0 COMMENT '排序序号',
    `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源分类表';

-- 创建学习资源表
CREATE TABLE `resources` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '资源ID',
    `title` VARCHAR(100) NOT NULL COMMENT '网站名称',
    `description` TEXT COMMENT '网站简介',
    `url` VARCHAR(255) NOT NULL COMMENT '网站链接',
    `category_id` BIGINT(20) DEFAULT NULL COMMENT '所属分类ID',
    `sort_order` INT DEFAULT 0 COMMENT '排序序号',
    `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
    `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_resource_category` FOREIGN KEY (`category_id`) REFERENCES `resource_categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习资源表';

-- 初始分类数据
INSERT INTO `resource_categories` (`name`, `sort_order`, `create_time`) VALUES
('刷题平台', 1, NOW()),
('教程百科', 2, NOW()),
('竞赛OJ', 3, NOW()),
('视频教程', 4, NOW());

-- 初始资源数据
INSERT INTO `resources` (`title`, `description`, `url`, `category_id`, `sort_order`, `create_time`) VALUES
('力扣（LeetCode）', '全球知名的算法刷题平台，海量题目覆盖各种算法与数据结构，支持多种编程语言在线编码，适合面试备战。', 'https://leetcode.cn', 1, 1, NOW()),
('牛客网', '国内IT求职与刷题平台，提供算法练习、笔试模拟、面试题库，涵盖各大企业真题。', 'https://www.nowcoder.com', 1, 2, NOW()),
('OI Wiki', '编程竞赛知识整合站点，涵盖算法、数据结构、数学、图论等竞赛必备知识，内容系统全面。', 'https://oi-wiki.org', 2, 1, NOW()),
('CSDN', '中国最大的IT技术社区，拥有海量算法教程、题解博客及编程学习资源。', 'https://www.csdn.net', 2, 2, NOW()),
('洛谷', '国内知名算法竞赛社区，提供丰富的题库、题解、讨论区，适合OI/ACM选手训练。', 'https://www.luogu.com.cn', 3, 1, NOW()),
('Codeforces', '全球顶级算法竞赛平台，定期举办线上比赛，题库质量高，社区活跃。', 'https://codeforces.com', 3, 2, NOW()),
('AtCoder', '日本知名算法竞赛平台，题目设计精巧，风格独特，适合提升算法思维。', 'https://atcoder.jp', 3, 3, NOW()),
('Virtual Judge', '聚合各大OJ题目的虚拟判题平台，支持创建比赛和团队训练。', 'https://vjudge.net', 3, 4, NOW()),
('PTA（拼题A）', '浙江大学推出的程序设计类教学与竞赛辅助平台，支持自动评测与考试。', 'https://pintia.cn', 3, 5, NOW()),
('B站算法教程', 'B站拥有大量优质的算法与数据结构视频教程，涵盖从入门到进阶的完整学习路径。', 'https://www.bilibili.com', 4, 1, NOW());
