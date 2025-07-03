-- 文字エンコーディング設定
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;

-- 初期データの挿入

-- ユーザーの初期データ
INSERT INTO users (user_id, name, generation, created_at, updated_at) VALUES
('admin1', '田中 健太', 45, NOW(), NOW()),
('admin2', '佐藤 由美', 46, NOW(), NOW()),
('member1', '鈴木 太郎', 45, NOW(), NOW()),
('member2', '高橋 花子', 46, NOW(), NOW()),
('member3', '伊藤 次郎', 47, NOW(), NOW()),
('member4', '渡辺 美咲', 48, NOW(), NOW()),
('member5', '山田 健太', 49, NOW(), NOW()),
('member6', '中村 愛子', 50, NOW(), NOW()),
('member7', '小林 大輔', 45, NOW(), NOW()),
('member8', '加藤 恵子', 46, NOW(), NOW());

-- 役割の初期データ
INSERT INTO roles (role_name, description, created_at, updated_at) VALUES
('admin', 'システム管理者', NOW(), NOW()),
('member', '一般部員', NOW(), NOW());

-- ユーザー役割の初期データ
INSERT INTO user_roles (user_id, role, created_at) VALUES
-- 管理者
('admin1', 'admin', NOW()),
('admin2', 'admin', NOW()),
-- メンバー
('member1', 'member', NOW()),
('member2', 'member', NOW()),
('member3', 'member', NOW()),
('member4', 'member', NOW()),
('member5', 'member', NOW()),
('member6', 'member', NOW()),
('member7', 'member', NOW()),
('member8', 'member', NOW());

-- タグの初期データ
INSERT INTO tags (name, created_at, created_by) VALUES
('技術勉強会', NOW(), 'system'),
('懇親会', NOW(), 'system'),
('ハッカソン', NOW(), 'system'),
('LT会', NOW(), 'system'),
('ワークショップ', NOW(), 'system'),
('React', NOW(), 'system'),
('AI', NOW(), 'system'),
('プログラミング', NOW(), 'system'),
('読書会', NOW(), 'system'),
('技術書', NOW(), 'system'),
('ゲーム開発', NOW(), 'system'),
('Unity', NOW(), 'system'),
('送別会', NOW(), 'system'),
('卒業生', NOW(), 'system'),
('デザイン', NOW(), 'system'),
('Figma', NOW(), 'system'),
('バックエンド', NOW(), 'system'),
('Go', NOW(), 'system'),
('フロントエンド', NOW(), 'system'),
('TypeScript', NOW(), 'system'),
('データサイエンス', NOW(), 'system'),
('Python', NOW(), 'system'),
('セキュリティ', NOW(), 'system'),
('モバイル', NOW(), 'system'),
('Flutter', NOW(), 'system'),
('オープンソース', NOW(), 'system'),
('GitHub', NOW(), 'system'),
('クラウド', NOW(), 'system'),
('AWS', NOW(), 'system'),
('機械学習', NOW(), 'system'),
('TensorFlow', NOW(), 'system'),
('ブロックチェーン', NOW(), 'system'),
('Ethereum', NOW(), 'system'),
('DevOps', NOW(), 'system'),
('Docker', NOW(), 'system'),
('UI/UX', NOW(), 'system'),
('プロジェクト管理', NOW(), 'system'),
('アジャイル', NOW(), 'system'),
('新入生', NOW(), 'system'),
('技術発表', NOW(), 'system');

-- イベントの初期データ
INSERT INTO events (event_id, organizer_id, title, description, status, venue, allowed_roles, editable_roles, tags, poll_type, poll_candidates, confirmed_date, schedule_deadline, created_at, updated_at) VALUES
('mock-event-1', 'admin1', '技術勉強会：React入門', 'Reactの基礎を学ぶ勉強会です', 'DRAFT', 'オンライン', '["member"]', '["admin"]', '["ワークショップ", "技術勉強会", "React"]', 'date_select', NULL, DATE_ADD(NOW(), INTERVAL 7 DAY), NULL, NOW(), NOW()),
('mock-event-2', 'admin2', '懇親会：新入生歓迎', '新入生を歓迎する懇親会です', 'CONFIRMED', '大学内カフェ', '["member", "admin"]', '["admin"]', '["懇親会", "新入生"]', 'date_select', NULL, DATE_ADD(NOW(), INTERVAL 14 DAY), NULL, NOW(), NOW()),
('mock-event-3', 'member1', 'LT会：技術発表', '技術に関するLT発表会です', 'SCHEDULE_POLLING', '会議室A', '["member"]', '["admin"]', '["LT会", "技術発表"]', 'date_select', JSON_ARRAY(DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 12 DAY)), NULL, DATE_ADD(NOW(), INTERVAL 10 DAY), NOW(), NOW()),
('mock-event-4', 'member2', 'ハッカソン：AIチャレンジ', 'AIを使ったハッカソンです', 'CONFIRMED', 'ラボ棟', '["member"]', '["admin"]', '["ハッカソン", "AI", "プログラミング"]', 'date_select', NULL, DATE_ADD(NOW(), INTERVAL 21 DAY), NULL, NOW(), NOW()),
('mock-event-5', 'member3', '読書会：技術書レビュー', '技術書の読書会です', 'DRAFT', '図書館', '["member"]', '["admin"]', '["読書会", "技術書"]', 'date_select', NULL, NULL, NULL, NOW(), NOW()),
('mock-event-6', 'member4', 'ゲーム開発ワークショップ', 'Unityを使ったゲーム開発ワークショップです', 'SCHEDULE_POLLING', 'PC教室', '["member"]', '["admin"]', '["ワークショップ", "ゲーム開発", "Unity"]', 'date_select', JSON_ARRAY(DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 17 DAY)), NULL, DATE_ADD(NOW(), INTERVAL 15 DAY), NOW(), NOW()),
('mock-event-7', 'member5', '卒業生送別会', '卒業生を送る会です', 'CONFIRMED', '大学会館', '["member", "admin"]', '["admin"]', '["送別会", "卒業生"]', 'date_select', NULL, DATE_ADD(NOW(), INTERVAL 30 DAY), NULL, NOW(), NOW()),
('mock-event-8', 'member6', 'デザインワークショップ', 'Figmaを使ったデザインワークショップです', 'DRAFT', 'デザイン室', '["member"]', '["admin"]', '["ワークショップ", "デザイン", "Figma"]', 'date_select', NULL, NULL, NULL, NOW(), NOW()),
('mock-event-9', 'member7', 'バックエンド勉強会', 'Goを使ったバックエンド勉強会です', 'CONFIRMED', 'オンライン', '["member"]', '["admin"]', '["勉強会", "バックエンド", "Go"]', 'date_select', NULL, DATE_ADD(NOW(), INTERVAL 5 DAY), NULL, NOW(), NOW()),
('mock-event-10', 'member8', 'フロントエンド勉強会', 'TypeScriptを使ったフロントエンド勉強会です', 'SCHEDULE_POLLING', 'オンライン', '["member"]', '["admin"]', '["勉強会", "フロントエンド", "TypeScript"]', 'date_select', JSON_ARRAY(DATE_ADD(NOW(), INTERVAL 12 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY)), NULL, DATE_ADD(NOW(), INTERVAL 12 DAY), NOW(), NOW()),
('mock-event-11', 'admin1', 'データサイエンス勉強会', 'Pythonを使ったデータサイエンス勉強会です', 'DRAFT', '統計室', '["member"]', '["admin"]', '["勉強会", "データサイエンス", "Python"]', 'date_select', NULL, NULL, NULL, NOW(), NOW()),
('mock-event-12', 'admin2', 'セキュリティ勉強会', 'セキュリティに関する勉強会です', 'CONFIRMED', 'セキュリティラボ', '["member", "admin"]', '["admin"]', '["勉強会", "セキュリティ"]', 'date_select', NULL, DATE_ADD(NOW(), INTERVAL 25 DAY), NULL, NOW(), NOW()),
('mock-event-13', 'member1', 'モバイルアプリ開発ワークショップ', 'Flutterを使ったモバイルアプリ開発ワークショップです', 'SCHEDULE_POLLING', 'モバイルラボ', '["member"]', '["admin"]', '["ワークショップ", "モバイル", "Flutter"]', 'date_select', JSON_ARRAY(DATE_ADD(NOW(), INTERVAL 18 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY)), NULL, DATE_ADD(NOW(), INTERVAL 18 DAY), NOW(), NOW()),
('mock-event-14', 'member2', 'オープンソース貢献勉強会', 'GitHubを使ったオープンソース貢献勉強会です', 'DRAFT', 'オンライン', '["member"]', '["admin"]', '["勉強会", "オープンソース", "GitHub"]', 'date_select', NULL, NULL, NULL, NOW(), NOW()),
('mock-event-15', 'member3', 'クラウドインフラ勉強会', 'AWSを使ったクラウドインフラ勉強会です', 'CONFIRMED', 'クラウドラボ', '["member"]', '["admin"]', '["勉強会", "クラウド", "AWS"]', 'date_select', NULL, DATE_ADD(NOW(), INTERVAL 35 DAY), NULL, NOW(), NOW()),
('mock-event-16', 'member4', '機械学習ワークショップ', 'TensorFlowを使った機械学習ワークショップです', 'SCHEDULE_POLLING', 'AIラボ', '["member"]', '["admin"]', '["ワークショップ", "機械学習", "TensorFlow"]', 'date_select', JSON_ARRAY(DATE_ADD(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 22 DAY)), NULL, DATE_ADD(NOW(), INTERVAL 20 DAY), NOW(), NOW()),
('mock-event-17', 'member5', 'ブロックチェーン勉強会', 'Ethereumを使ったブロックチェーン勉強会です', 'DRAFT', 'ブロックチェーンラボ', '["member"]', '["admin"]', '["勉強会", "ブロックチェーン", "Ethereum"]', 'date_select', NULL, NULL, NULL, NOW(), NOW()),
('mock-event-18', 'member6', 'DevOps勉強会', 'Dockerを使ったDevOps勉強会です', 'CONFIRMED', 'DevOpsラボ', '["member", "admin"]', '["admin"]', '["勉強会", "DevOps", "Docker"]', 'date_select', NULL, DATE_ADD(NOW(), INTERVAL 40 DAY), NULL, NOW(), NOW()),
('mock-event-19', 'member7', 'UI/UXデザイン勉強会', 'UI/UXデザインに関する勉強会です', 'SCHEDULE_POLLING', 'デザイン室', '["member"]', '["admin"]', '["勉強会", "UI/UX", "デザイン"]', 'date_select', JSON_ARRAY(DATE_ADD(NOW(), INTERVAL 22 DAY), DATE_ADD(NOW(), INTERVAL 24 DAY)), NULL, DATE_ADD(NOW(), INTERVAL 22 DAY), NOW(), NOW()),
('mock-event-20', 'member8', 'プロジェクト管理勉強会', 'アジャイルを使ったプロジェクト管理勉強会です', 'DRAFT', '会議室B', '["member"]', '["admin"]', '["勉強会", "プロジェクト管理", "アジャイル"]', 'date_select', NULL, NULL, NULL, NOW(), NOW());

-- イベント参加者の初期データ
INSERT INTO event_participants (event_id, user_id, joined_at, status) VALUES
('mock-event-1', 'member1', DATE_SUB(NOW(), INTERVAL 1 DAY), 'CONFIRMED'),
('mock-event-1', 'member2', DATE_SUB(NOW(), INTERVAL 2 DAY), 'PENDING'),
('mock-event-1', 'admin1', DATE_SUB(NOW(), INTERVAL 1 DAY), 'CONFIRMED'),
('mock-event-2', 'member3', DATE_SUB(NOW(), INTERVAL 1 DAY), 'CONFIRMED'),
('mock-event-2', 'member4', DATE_SUB(NOW(), INTERVAL 2 DAY), 'PENDING'),
('mock-event-2', 'admin2', DATE_SUB(NOW(), INTERVAL 1 DAY), 'CONFIRMED'),
('mock-event-4', 'member5', DATE_SUB(NOW(), INTERVAL 1 DAY), 'CONFIRMED'),
('mock-event-4', 'member6', DATE_SUB(NOW(), INTERVAL 2 DAY), 'PENDING'),
('mock-event-4', 'member1', DATE_SUB(NOW(), INTERVAL 1 DAY), 'CONFIRMED'); 