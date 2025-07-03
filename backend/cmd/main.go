package main

import (
	"event-management-system/backend/internal/infrastructure/in_memory"
	"event-management-system/backend/internal/interface/http"
	"event-management-system/backend/internal/usecase/command"
	"event-management-system/backend/internal/usecase/query"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// インフラストラクチャ層の初期化
	eventRepo := in_memory.NewInMemoryEventRepository()
	userRepo := in_memory.NewInMemoryUserRepository()

	// ユースケース層の初期化
	eventCommandUsecase := command.NewEventCommandUsecase(eventRepo, userRepo)
	eventQueryUsecase := query.NewEventQueryUsecase(eventRepo)
	userQueryUsecase := query.NewUserQueryUsecase(userRepo)

	// HTTPハンドラの初期化
	eventHandler := http.NewEventHandler(eventCommandUsecase, eventQueryUsecase)
	userHandler := http.NewUserHandler(userQueryUsecase)

	// Ginルーターの設定
	r := gin.Default()

	// ミドルウェアの設定
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// CORSミドルウェアの追加
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// ルートの登録
	eventHandler.RegisterRoutes(r)
	userHandler.RegisterRoutes(r)

	// ヘルスチェックエンドポイント
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// サーバー起動
	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
