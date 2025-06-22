package main

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Echoインスタンスを作成
	e := echo.New()

	// ミドルウェアを追加
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// APIルートを設定
	api := e.Group("/api/v1")

	// イベント関連のエンドポイント
	events := api.Group("/events")
	events.GET("", listEventsHandler)
	events.POST("", createEventHandler)
	events.GET("/:id", getEventHandler)
	events.POST("/:id/register", registerForEventHandler)

	// ヘルスチェック
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "ok",
			"time":   "2024-01-01T00:00:00Z",
		})
	})

	// サーバーを起動
	log.Fatal(e.Start(":8080"))
}

// イベント一覧取得ハンドラ（モック実装）
func listEventsHandler(c echo.Context) error {
	// モックデータを返す
	mockEvents := map[string]interface{}{
		"events": []map[string]interface{}{
			{
				"id":            "event_1",
				"title":         "新歓合宿",
				"finalizedDate": "2024-04-01T10:00:00Z",
				"status":        "CONFIRMED",
				"organizerName": "田中太郎",
			},
			{
				"id":            "event_2",
				"title":         "夏合宿",
				"finalizedDate": nil,
				"status":        "DRAFT",
				"organizerName": "佐藤花子",
			},
		},
		"pagination": map[string]interface{}{
			"page":       1,
			"pageSize":   20,
			"total":      2,
			"totalPages": 1,
		},
	}

	return c.JSON(http.StatusOK, mockEvents)
}

// イベント作成ハンドラ（モック実装）
func createEventHandler(c echo.Context) error {
	var requestBody map[string]interface{}
	if err := c.Bind(&requestBody); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	// モックレスポンス
	response := map[string]string{
		"eventId": "event_" + "123456789",
	}

	return c.JSON(http.StatusCreated, response)
}

// イベント詳細取得ハンドラ（モック実装）
func getEventHandler(c echo.Context) error {
	eventID := c.Param("id")

	// モックデータを返す
	mockEvent := map[string]interface{}{
		"id":          eventID,
		"title":       "新歓合宿",
		"description": "春の新歓合宿です！",
		"status":      "CONFIRMED",
		"organizer": map[string]interface{}{
			"userId":    "user_1",
			"name":      "田中太郎",
			"generation": "2023",
		},
		"venue":        "奥多摩",
		"allowedRoles": []string{"CircleAdmin", "RegularMember"},
		"tags":         []string{"合宿", "新歓"},
		"schedulePoll": map[string]interface{}{
			"pollId":         "poll_1",
			"pollType":       "date",
			"candidateDates": []string{"2024-04-01T10:00:00Z", "2024-04-02T10:00:00Z"},
			"responses":      []map[string]interface{}{},
			"finalizedDate":  "2024-04-01T10:00:00Z",
		},
		"feeSettings": []map[string]interface{}{
			{
				"applicableRole":      "RegularMember",
				"applicableGeneration": "2023",
				"fee": map[string]interface{}{
					"amount":   5000,
					"currency": "JPY",
				},
			},
		},
		"registrations": []map[string]interface{}{
			{
				"registrationId": "reg_1",
				"user": map[string]interface{}{
					"userId":    "user_2",
					"name":      "山田花子",
					"generation": "2023",
				},
				"status": "REGISTERED",
				"appliedFee": map[string]interface{}{
					"amount":   5000,
					"currency": "JPY",
				},
				"registeredAt": "2024-01-15T10:00:00Z",
			},
		},
	}

	return c.JSON(http.StatusOK, mockEvent)
}

// 参加登録ハンドラ（モック実装）
func registerForEventHandler(c echo.Context) error {
	eventID := c.Param("id")

	// モックレスポンス
	response := map[string]string{
		"registrationId": "reg_" + eventID + "_" + "123456789",
	}

	return c.JSON(http.StatusCreated, response)
} 