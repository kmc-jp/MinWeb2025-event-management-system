package http

import (
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware は認証ミドルウェア
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 開発環境かどうかをチェック
		isDevelopment := os.Getenv("ENV") == "development" || os.Getenv("ENV") == ""

		if isDevelopment {
			// 開発環境ではヘッダーからユーザー情報を取得
			userID := c.GetHeader("X-User-ID")
			userRolesStr := c.GetHeader("X-User-Roles")
			userGenerationStr := c.GetHeader("X-User-Generation")

			if userID != "" {
				// ユーザー情報をコンテキストに設定
				c.Set("user_id", userID)

				// 役割を配列に変換
				var userRoles []string
				if userRolesStr != "" {
					userRoles = strings.Split(userRolesStr, ",")
				}
				c.Set("user_roles", userRoles)

				// 世代を数値に変換
				if userGenerationStr != "" {
					if generation, err := strconv.Atoi(userGenerationStr); err == nil {
						c.Set("user_generation", generation)
					}
				}
			} else {
				// ヘッダーがない場合はデフォルトユーザーを設定
				c.Set("user_id", "member-user-1")
				c.Set("user_roles", []string{"member"})
				c.Set("user_generation", 26)
			}
		} else {
			// 本番環境ではOpenID Connectなどの認証を使用
			// ここに本番環境の認証処理を追加
			c.Set("user_id", "production-user")
			c.Set("user_name", "本番ユーザー")
			c.Set("user_roles", []string{"member"})
			c.Set("user_generation", 1)
		}

		c.Next()
	}
}
