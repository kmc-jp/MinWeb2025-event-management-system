-- 文字エンコーディング設定
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;

-- イベントテーブルを作成
CREATE TABLE IF NOT EXISTS events (
    event_id VARCHAR(36) PRIMARY KEY,
    organizer_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('DRAFT', 'SCHEDULE_POLLING', 'CONFIRMED', 'FINISHED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    venue VARCHAR(255),
    allowed_roles JSON,
    editable_roles JSON,
    tags JSON,
    poll_type VARCHAR(50),
    poll_candidates JSON,
    confirmed_date TIMESTAMP NULL,
    schedule_deadline TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- インデックス
    INDEX idx_organizer_id (organizer_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_confirmed_date (confirmed_date),
    
    -- 外部キー制約
    FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 