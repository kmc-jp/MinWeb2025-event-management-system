-- 役割テーブルの作成
CREATE TABLE IF NOT EXISTS roles (
    name VARCHAR(50) PRIMARY KEY,
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    allowed_assigners JSON NOT NULL DEFAULT '[]'
);

-- 初期データの挿入
INSERT IGNORE INTO roles (name, description, created_at, created_by, allowed_assigners) VALUES
('admin', 'システム管理者', '2023-01-01 00:00:00', 'system', '["admin"]'),
('member', '一般部員', '2023-01-01 00:00:00', 'system', '["admin"]'); 