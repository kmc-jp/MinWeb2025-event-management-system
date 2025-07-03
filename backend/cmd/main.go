package main

import (
	"database/sql"
	"event-management-system/backend/internal/infrastructure/mysql"
	"event-management-system/backend/internal/interface/http"
	"event-management-system/backend/internal/usecase/command"
	"event-management-system/backend/internal/usecase/query"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	// データベース接続情報の取得
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "3306"
	}
	dbDatabase := os.Getenv("DB_DATABASE")
	if dbDatabase == "" {
		dbDatabase = "events_db"
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "events_user"
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "events_password"
	}

	// DSNの構築
	dsn := dbUser + ":" + dbPassword + "@tcp(" + dbHost + ":" + dbPort + ")/" + dbDatabase + "?parseTime=true&loc=Local"

	// データベース接続の作成
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}
	defer db.Close()

	// データベース接続をテスト
	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	// インフラストラクチャ層の初期化
	eventRepo := mysql.NewMySQLEventRepositoryWithDB(db)
	userRepo := mysql.NewMySQLUserRepository(db)

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
