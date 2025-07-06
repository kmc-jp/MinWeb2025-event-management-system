# データベースマイグレーション

このディレクトリには、イベント管理システムのデータベースマイグレーションファイルが含まれています。

## ファイル構成

- `001_initial_schema.sql` - 初期スキーマ作成
- `002_seed_data.sql` - 初期データ投入（認証用ダミーユーザー、管理者ユーザー、部員ロールなど）

## 実行順序

マイグレーションファイルは以下の順序で実行してください：

1. `001_initial_schema.sql` - テーブル作成
2. `002_seed_data.sql` - 初期データ投入

## 実行方法

### Docker Compose 環境での実行

```bash
# 初回起動時（マイグレーションが自動実行される）
docker-compose up -d

# 既存のコンテナがある場合は、データベースをリセットして再実行
docker-compose down -v
docker-compose up -d

# マイグレーション実行状況の確認
docker-compose exec db mysql -u root -p -e "USE event_management; SELECT * FROM migration_history;"

# 手動でマイグレーションを実行する場合
docker-compose exec db mysql -u root -p event_management -e "source /docker-entrypoint-initdb.d/001_initial_schema.sql;"
docker-compose exec db mysql -u root -p event_management -e "source /docker-entrypoint-initdb.d/002_seed_data.sql;"
```

### 手動実行

```bash
# MySQLに接続
mysql -u root -p event_management

# マイグレーションファイルを実行
source /path/to/001_initial_schema.sql;
source /path/to/002_seed_data.sql;
```

## 初期データの内容

### 役割（Roles）

- `admin` - システム管理者（すべての機能にアクセス可能）
- `member` - 部員（イベントの参加・作成が可能）
- `guest` - ゲスト（イベントの閲覧のみ可能）

### ユーザー（Users）

- 認証用ダミーユーザー（3 名）- 部員ロールを持つ
- 管理者ユーザー（2 名）- 管理者ロールと部員ロールの両方を持つ
- 一般部員ユーザー（5 名）- 部員ロールを持つ
- ゲストユーザー（2 名）- ゲストロールを持つ

### サンプルデータ

- サンプルイベント（3 件）
- サンプルタグ（8 件）
- サンプル参加者データ
- サンプル料金設定

## 注意事項

- マイグレーションファイルは一度だけ実行してください
- 本番環境で実行する前に、必ずバックアップを取得してください
- 外部キー制約により、データの整合性が保たれます
