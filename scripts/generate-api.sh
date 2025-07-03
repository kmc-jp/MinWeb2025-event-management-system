#!/bin/bash

# OpenAPI Generatorを使用してAPI実装を自動生成するスクリプト
# 使用方法: ./scripts/generate-api.sh [backend|frontend|all]

set -e

# 色付きのログ出力
log_info() {
    echo -e "\033[32m[INFO]\033[0m $1"
}

log_warn() {
    echo -e "\033[33m[WARN]\033[0m $1"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

# OpenAPI Generatorのバージョン
GENERATOR_VERSION="6.6.0"

# プロジェクトルートディレクトリ
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OPENAPI_SPEC="$PROJECT_ROOT/api/openapi.yaml"

# 出力ディレクトリ
BACKEND_OUTPUT="$PROJECT_ROOT/backend/internal/generated"
FRONTEND_OUTPUT="$PROJECT_ROOT/frontend/src/generated"

# 生成対象の確認
TARGET="${1:-all}"

if [[ ! "$TARGET" =~ ^(backend|frontend|all)$ ]]; then
    log_error "無効なターゲット: $TARGET"
    echo "使用方法: $0 [backend|frontend|all]"
    exit 1
fi

# OpenAPI仕様書の存在確認
if [[ ! -f "$OPENAPI_SPEC" ]]; then
    log_error "OpenAPI仕様書が見つかりません: $OPENAPI_SPEC"
    exit 1
fi

log_info "OpenAPI仕様書: $OPENAPI_SPEC"

# Dockerイメージの存在確認
check_docker_image() {
    if ! docker image inspect openapitools/openapi-generator-cli:v$GENERATOR_VERSION >/dev/null 2>&1; then
        log_info "OpenAPI Generator Dockerイメージをダウンロード中..."
        docker pull openapitools/openapi-generator-cli:v$GENERATOR_VERSION
    fi
}

# Dockerを使用してOpenAPI Generatorを実行
run_generator() {
    local generator="$1"
    local output="$2"
    local additional_options="$3"
    
    log_info "生成中: $generator -> $output"
    
    # 出力ディレクトリを作成（ホスト側）
    mkdir -p "$output"
    
    # Dockerコンテナ内のパスを計算
    local container_output_path="/local/$(echo "$output" | sed "s|$PROJECT_ROOT/||")"
    
    # Dockerを使用してOpenAPI Generatorを実行
    docker run --rm \
        -v "$PROJECT_ROOT:/local" \
        -w /local \
        openapitools/openapi-generator-cli:v$GENERATOR_VERSION generate \
        -i "/local/api/openapi.yaml" \
        -g "$generator" \
        -o "$container_output_path" \
        --additional-properties=packageName=generated \
        $additional_options
    
    log_info "生成完了: $output"
}

# Backend生成（Go + Gin）
generate_backend() {
    log_info "Backend API実装を生成中..."
    
    # Go + Gin用の設定
    local go_options="--additional-properties=packageName=generated,serverPort=8080,sourceFolder=internal/generated,apiPackage=api,modelPackage=model"
    
    run_generator "go-gin-server" "$BACKEND_OUTPUT" "$go_options"
    
    # 生成されたファイルの調整
    if [[ -f "$BACKEND_OUTPUT/go.mod" ]]; then
        log_info "go.modを調整中..."
        # 既存のgo.modとマージするか、必要に応じて調整
        if [[ -f "$PROJECT_ROOT/backend/go.mod" ]]; then
            log_warn "既存のgo.modが存在します。手動で統合が必要です。"
        fi
    fi
    
    log_info "Backend生成完了"
}

# Frontend生成（TypeScript + Axios）
generate_frontend() {
    log_info "Frontend API実装を生成中..."
    
    # TypeScript + Axios用の設定
    local ts_options="--additional-properties=supportsES6=true,npmName=@event-management-system/api-client,npmVersion=1.0.0,withInterfaces=true,typescriptThreePlus=true"
    
    run_generator "typescript-axios" "$FRONTEND_OUTPUT" "$ts_options"
    
    # 生成されたファイルの調整
    if [[ -f "$FRONTEND_OUTPUT/package.json" ]]; then
        log_info "package.jsonを調整中..."
        # 既存のpackage.jsonとマージするか、必要に応じて調整
        if [[ -f "$PROJECT_ROOT/frontend/package.json" ]]; then
            log_warn "既存のpackage.jsonが存在します。手動で統合が必要です。"
        fi
    fi
    
    log_info "Frontend生成完了"
}

# メイン処理
main() {
    log_info "OpenAPI Generator v$GENERATOR_VERSION を使用してAPI実装を生成します"
    
    check_docker_image
    
    case "$TARGET" in
        "backend")
            generate_backend
            ;;
        "frontend")
            generate_frontend
            ;;
        "all")
            generate_backend
            generate_frontend
            ;;
    esac
    
    log_info "API実装の自動生成が完了しました"
    
    # 次のステップの案内
    echo ""
    log_info "次のステップ:"
    echo "1. 生成されたファイルを確認"
    echo "2. 必要に応じて手動で調整"
    echo "3. 既存のコードと統合"
    echo "4. テストを実行"
    echo ""
    log_warn "注意: 生成されたコードは既存の実装と統合が必要です"
}

# スクリプト実行
main "$@" 