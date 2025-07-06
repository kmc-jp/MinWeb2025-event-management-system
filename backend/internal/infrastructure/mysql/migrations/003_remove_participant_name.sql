-- マイグレーション実行履歴を記録
INSERT IGNORE INTO migration_history (migration_file) VALUES ('003_remove_participant_name.sql');

-- event_participantsテーブルからnameカラムを削除
ALTER TABLE event_participants DROP COLUMN name; 