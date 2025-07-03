FROM node:18-alpine AS builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci --only=production

# ソースコードのコピー
COPY . .

# Next.jsの設定ファイルを作成（静的エクスポート用）
RUN echo 'module.exports = { output: "export", trailingSlash: true, images: { unoptimized: true } }' > next.config.js

# ビルド実行
RUN npm run build

# 本番用イメージ
FROM nginx:alpine

# Nginx設定のコピー
COPY nginx.conf /etc/nginx/nginx.conf

# ビルドされたファイルをコピー
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"] 