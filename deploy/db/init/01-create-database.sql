-- 只创建数据库；所有表结构与种子数据由后端启动时的 Flyway 迁移负责
CREATE DATABASE IF NOT EXISTS company_mono
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;
