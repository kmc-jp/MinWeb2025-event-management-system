-- 初期データ投入
-- 認証用ダミーユーザー、管理者ユーザー、部員ロールなどの初期データ

-- マイグレーション実行履歴を記録
INSERT IGNORE INTO migration_history (migration_file) VALUES ('002_seed_data.sql');

-- システムユーザーの作成（外部キー制約のため）
INSERT INTO users (user_id, name, generation, created_at) VALUES
('system', 'システム', 1, NOW());

-- 役割データの投入
INSERT INTO roles (name, description, created_at, created_by) VALUES
('admin', 'システム管理者 - すべての機能にアクセス可能', NOW(), 'system'),
('member', '部員 - イベントの参加・作成が可能', NOW(), 'system'),
('guest', 'ゲスト - イベントの閲覧のみ可能', NOW(), 'system');

-- 認証用ダミーユーザーの投入
INSERT INTO users (user_id, name, generation, created_at) VALUES
('auth-dummy-user-1', '認証テストユーザー1', 25, NOW()),
('auth-dummy-user-2', '認証テストユーザー2', 26, NOW()),
('auth-dummy-user-3', '認証テストユーザー3', 27, NOW());

-- 管理者ユーザーの投入（部員ロールも持つ）
INSERT INTO users (user_id, name, generation, created_at) VALUES
('admin-user-1', '管理者ユーザー1', 24, NOW()),
('admin-user-2', '管理者ユーザー2', 25, NOW());

-- 一般部員ユーザーの投入
INSERT INTO users (user_id, name, generation, created_at) VALUES
('member-user-1', '部員ユーザー1', 26, NOW()),
('member-user-2', '部員ユーザー2', 27, NOW()),
('member-user-3', '部員ユーザー3', 28, NOW()),
('member-user-4', '部員ユーザー4', 29, NOW()),
('member-user-5', '部員ユーザー5', 30, NOW());

-- ゲストユーザーの投入
INSERT INTO users (user_id, name, generation, created_at) VALUES
('guest-user-1', 'ゲストユーザー1', 31, NOW()),
('guest-user-2', 'ゲストユーザー2', 32, NOW());

-- ユーザーと役割の関連付け
-- 認証用ダミーユーザーは部員ロールを持つ
INSERT INTO user_roles (user_id, role, created_at) VALUES
('auth-dummy-user-1', 'member', NOW()),
('auth-dummy-user-2', 'member', NOW()),
('auth-dummy-user-3', 'member', NOW());

-- 管理者ユーザーは管理者ロールと部員ロールの両方を持つ
INSERT INTO user_roles (user_id, role, created_at) VALUES
('admin-user-1', 'admin', NOW()),
('admin-user-1', 'member', NOW()),
('admin-user-2', 'admin', NOW()),
('admin-user-2', 'member', NOW());

-- 一般部員ユーザーは部員ロールを持つ
INSERT INTO user_roles (user_id, role, created_at) VALUES
('member-user-1', 'member', NOW()),
('member-user-2', 'member', NOW()),
('member-user-3', 'member', NOW()),
('member-user-4', 'member', NOW()),
('member-user-5', 'member', NOW());

-- ゲストユーザーはゲストロールを持つ
INSERT INTO user_roles (user_id, role, created_at) VALUES
('guest-user-1', 'guest', NOW()),
('guest-user-2', 'guest', NOW());

-- サンプルタグの投入
INSERT INTO tags (name, created_at, created_by) VALUES
('勉強会', NOW(), 'admin-user-1'),
('飲み会', NOW(), 'admin-user-1'),
('合宿', NOW(), 'admin-user-1'),
('ハッカソン', NOW(), 'admin-user-1'),
('LT会', NOW(), 'admin-user-1'),
('部活', NOW(), 'admin-user-1'),
('技術', NOW(), 'admin-user-1'),
('交流', NOW(), 'admin-user-1');

-- サンプルイベントの投入
INSERT INTO events (event_id, title, description, status, venue, organizer_name, created_at) VALUES
('sample-event-1', '技術勉強会', '最新の技術について学ぶ勉強会です。', 'CONFIRMED', '会議室A', 'admin-user-1', NOW()),
('sample-event-2', '新入生歓迎会', '新入生を歓迎する飲み会です。', 'SCHEDULE_POLLING', '未定', 'member-user-1', NOW()),
('sample-event-3', '夏合宿', '夏の合宿イベントです。', 'SCHEDULE_POLLING', '未定', 'admin-user-2', NOW());

-- イベントとタグの関連付け
INSERT INTO event_tags (event_id, tag_name, created_at) VALUES
('sample-event-1', '勉強会', NOW()),
('sample-event-1', '技術', NOW()),
('sample-event-2', '飲み会', NOW()),
('sample-event-2', '交流', NOW()),
('sample-event-3', '合宿', NOW()),
('sample-event-3', '部活', NOW());

-- イベント参加可能役割の設定
INSERT INTO event_participation_roles (event_id, role_name, created_at) VALUES
('sample-event-1', 'member', NOW()),
('sample-event-2', 'member', NOW()),
('sample-event-3', 'member', NOW());

-- イベント編集可能役割の設定
INSERT INTO event_edit_roles (event_id, role_name, created_at) VALUES
('sample-event-1', 'admin', NOW()),
('sample-event-2', 'admin', NOW()),
('sample-event-2', 'member', NOW()),
('sample-event-3', 'admin', NOW());

-- サンプル参加者の投入
INSERT INTO event_participants (event_id, user_id, generation, status, joined_at) VALUES
('sample-event-1', 'member-user-1', 26, 'CONFIRMED', NOW()),
('sample-event-1', 'member-user-2', 27, 'PENDING', NOW()),
('sample-event-2', 'member-user-3', 28, 'CONFIRMED', NOW()),
('sample-event-2', 'member-user-4', 29, 'CONFIRMED', NOW()),
('sample-event-3', 'member-user-5', 30, 'PENDING', NOW());

-- サンプル料金設定の投入
INSERT INTO fee_settings (event_id, applicable_generation, amount, currency, created_at) VALUES
('sample-event-1', 25, 500, 'JPY', NOW()),
('sample-event-1', 26, 500, 'JPY', NOW()),
('sample-event-1', 27, 500, 'JPY', NOW()),
('sample-event-2', 25, 3000, 'JPY', NOW()),
('sample-event-2', 26, 3000, 'JPY', NOW()),
('sample-event-2', 27, 3000, 'JPY', NOW()),
('sample-event-3', 25, 15000, 'JPY', NOW()),
('sample-event-3', 26, 15000, 'JPY', NOW()),
('sample-event-3', 27, 15000, 'JPY', NOW()); 