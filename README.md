# イベント管理システム

## 開発・ビルド・デバッグ・デプロイコマンド

### 開発環境

```bash
# 全サービス起動
docker-compose up

# バックエンドのみ起動
docker-compose up backend db

# フロントエンドのみ起動
docker-compose up frontend

# 開発環境でバックエンド実行
cd backend && go run cmd/main.go

# 開発環境でフロントエンド実行
cd frontend && npm run dev
```

### ビルド

```bash
# 全サービスビルド
docker-compose build

# バックエンドビルド
docker build -f backend/Dockerfile -t event-management-backend ./backend

# フロントエンドビルド
cd frontend && npm run build
```

### デバッグ

```bash
# バックエンドテスト
cd backend && go test ./...

# フロントエンドテスト
cd frontend && npm run test

# フロントエンドlint
cd frontend && npm run lint
```

### API 生成

```bash
# API実装自動生成
./scripts/generate-api.sh all

# バックエンドのみ生成
./scripts/generate-api.sh backend

# フロントエンドのみ生成
./scripts/generate-api.sh frontend
```

## ディレクトリ構成

```
MinWeb2025-event-management-system/
├── api/                    # OpenAPI仕様書
├── backend/                # Go + Gin バックエンド
│   ├── cmd/main.go        # エントリーポイント
│   ├── internal/
│   │   ├── domain/        # ドメインモデル
│   │   ├── usecase/       # ユースケース
│   │   ├── interface/     # HTTPハンドラ
│   │   └── infrastructure/ # データアクセス層
│   └── generated/         # 自動生成コード
├── frontend/              # Next.js フロントエンド
│   ├── src/app/          # ページコンポーネント
│   ├── src/lib/          # ユーティリティ
│   └── generated/        # 自動生成コード
├── scripts/              # ビルド・生成スクリプト
└── docker-compose.yml    # 開発環境設定
```

## Backend 実装済み機能

### エンドポイント

- `POST /api/events` - イベント作成
- `GET /api/events` - イベント一覧取得（ページネーション対応）
- `GET /api/events/:id` - イベント詳細取得
- `GET /api/users/me` - 現在のユーザー情報取得
- `GET /api/users/:id` - ユーザー詳細取得

### 機能

- イベント CRUD 操作
- ユーザー管理
- 料金設定管理
- タグ管理
- 日程調整機能
- 役割ベースアクセス制御

### 技術スタック

- Go 1.23.0
- Gin Web Framework
- MySQL 8.0
- OpenAPI Generator

## Frontend 実装済み機能

### ページ

- `/` - メインページ（イベント一覧にリダイレクト）
- `/events` - イベント一覧（フィルタリング・ページネーション）
- `/events/new` - イベント作成フォーム
- `/events/[id]` - イベント詳細表示

### 機能

- イベント一覧表示
- イベント作成フォーム
- イベント詳細表示
- ステータスフィルタリング
- レスポンシブデザイン
- エラーハンドリング

### 技術スタック

- Next.js 14.0.4
- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Query
- Zustand
