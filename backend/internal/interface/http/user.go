package http

import (
	"event-management-system/backend/internal/usecase/query"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UserHandler はユーザー関連のHTTPハンドラ
type UserHandler struct {
	userQueryUsecase *query.UserQueryUsecase
}

// NewUserHandler は新しいユーザーハンドラを作成
func NewUserHandler(uqu *query.UserQueryUsecase) *UserHandler {
	return &UserHandler{
		userQueryUsecase: uqu,
	}
}

// GetUser はユーザー詳細取得エンドポイント
func (h *UserHandler) GetUser(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	user, err := h.userQueryUsecase.GetUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetCurrentUser は現在のユーザー情報取得エンドポイント
func (h *UserHandler) GetCurrentUser(c *gin.Context) {
	// 認証情報からユーザーIDを取得（実際の実装では認証ミドルウェアから取得）
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	user, err := h.userQueryUsecase.GetUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// RegisterRoutes はユーザー関連のルートを登録
func (h *UserHandler) RegisterRoutes(r *gin.Engine) {
	users := r.Group("/api/users")
	{
		users.GET("/me", h.GetCurrentUser)
		users.GET("/:id", h.GetUser)
	}
}
