-- 世代フィールドの型をstringからintに変更
ALTER TABLE users MODIFY COLUMN generation INT NOT NULL;

-- 既存のデータを更新（文字列の世代を数値に変換）
UPDATE users SET generation = 1 WHERE generation = '2023' OR generation = '2024' OR generation = '2025'; 