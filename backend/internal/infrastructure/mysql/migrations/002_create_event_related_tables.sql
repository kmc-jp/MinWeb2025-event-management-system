-- 文字エンコーディング設定
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;

-- イベント許可役割テーブルを作成
CREATE TABLE IF NOT EXISTS event_allowed_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- インデックス
    INDEX idx_event_id (event_id),
    INDEX idx_role (role),
    
    -- 外部キー制約
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    
    -- ユニーク制約
    UNIQUE KEY unique_event_role (event_id, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- イベント編集可能役割テーブルを作成
CREATE TABLE IF NOT EXISTS event_editable_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- インデックス
    INDEX idx_event_id (event_id),
    INDEX idx_role_name (role_name),
    
    -- 外部キー制約
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    
    -- ユニーク制約
    UNIQUE KEY unique_event_role_name (event_id, role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- イベントタグテーブルを作成
CREATE TABLE IF NOT EXISTS event_tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- インデックス
    INDEX idx_event_id (event_id),
    INDEX idx_tag (tag),
    
    -- 外部キー制約
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    
    -- ユニーク制約
    UNIQUE KEY unique_event_tag (event_id, tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- イベント料金設定テーブルを作成
CREATE TABLE IF NOT EXISTS event_fee_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    applicable_generation BIGINT NOT NULL,
    fee_amount BIGINT NOT NULL,
    fee_currency VARCHAR(10) NOT NULL DEFAULT 'JPY',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- インデックス
    INDEX idx_event_id (event_id),
    INDEX idx_applicable_generation (applicable_generation),
    
    -- 外部キー制約
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    
    -- ユニーク制約
    UNIQUE KEY unique_event_generation (event_id, applicable_generation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- イベント日程調整テーブルを作成
CREATE TABLE IF NOT EXISTS event_schedule_polls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    poll_data JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- インデックス
    INDEX idx_event_id (event_id),
    
    -- 外部キー制約
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    
    -- ユニーク制約
    UNIQUE KEY unique_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 