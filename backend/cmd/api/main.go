package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"event-management-system/backend/internal/application/command"
	"event-management-system/backend/internal/infrastructure/repository"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Echo インスタンスを作成
	e := echo.New()

	// ミドルウェアを追加
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// リポジトリの初期化
	var eventRepo repository.EventRepository
	var err error

	// 環境変数に基づいてリポジトリを選択
	if os.Getenv("USE_MYSQL") == "true" {
		log.Println("Using MySQL repository")
		eventRepo, err = repository.NewMySQLEventRepository()
		if err != nil {
			log.Fatalf("Failed to initialize MySQL repository: %v", err)
		}
	} else {
		log.Println("Using memory repository")
		eventRepo = repository.NewMemoryEventRepository()
	}

	createHandler := command.NewCreateEventCommandHandler(eventRepo)

	// ルートを設定
	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"message": "Event Management System API",
			"status":  "running",
		})
	})

	e.POST("/events", func(c echo.Context) error {
		var req command.CreateEventCommand
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
		}
		event, err := createHandler.Handle(context.Background(), req)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusCreated, event)
	})

	// サーバーを起動
	e.Logger.Fatal(e.Start(":8080"))
}
