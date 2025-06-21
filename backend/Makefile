DB_DSN="events_user:events_password@tcp(127.0.0.1:3306)/events_db?parseTime=true"

.PHONY: help build test run migrate-create migrate-up migrate-down migrate-status generate-api-server generate-mocks

help: ## 利用可能なコマンドを表示
	@echo "利用可能なコマンド:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## アプリケーションをビルド
	go build -o bin/api cmd/api/main.go

test: ## テストを実行
	go test -v ./...

run: ## アプリケーションを実行
	go run cmd/api/main.go

migrate-create: ## 新しいマイグレーションファイルを作成
	@if [ -z "$(NAME)" ]; then echo "NAME=マイグレーション名を指定してください"; exit 1; fi
	goose -dir ./migrations create $(NAME) sql

migrate-up: ## マイグレーションを実行
	goose -dir ./migrations mysql "$(DB_DSN)" up

migrate-down: ## マイグレーションをロールバック
	goose -dir ./migrations mysql "$(DB_DSN)" down

migrate-status: ## マイグレーションの状態を確認
	goose -dir ./migrations mysql "$(DB_DSN)" status

generate-api-server: ## OpenAPIからサーバーコードを生成
	openapi-generator-cli generate \
		-i ../docs/api/openapi.yaml \
		-g go-echo-server \
		-o internal/interface/api/ \
		--additional-properties=packageName=api

generate-mocks: ## モックを生成
	mockery --all --output internal/domain/mocks --outpkg mocks 