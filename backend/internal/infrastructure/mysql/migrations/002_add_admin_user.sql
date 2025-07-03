-- adminユーザーの追加
INSERT IGNORE INTO users (user_id, name, generation) VALUES
('admin1', 'Admin User', '2023');

-- adminユーザーにadminロールを付与
INSERT IGNORE INTO user_roles (user_id, role) VALUES
('admin1', 'admin'); 