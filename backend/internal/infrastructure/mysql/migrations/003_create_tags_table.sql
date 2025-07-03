-- タグテーブルの作成
CREATE TABLE IF NOT EXISTS tags (
    name VARCHAR(50) PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    INDEX idx_created_at (created_at)
);

-- 初期タグデータの挿入
INSERT IGNORE INTO tags (name, created_by) VALUES
('技術勉強会', 'system'),
('懇親会', 'system'),
('ハッカソン', 'system'),
('LT会', 'system'),
('ワークショップ', 'system'); 