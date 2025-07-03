-- イベントテーブルに日程関連のカラムを追加
ALTER TABLE events 
ADD COLUMN confirmed_date DATETIME NULL COMMENT '確定した日程',
ADD COLUMN schedule_deadline DATETIME NULL COMMENT '日程確定予定日'; 