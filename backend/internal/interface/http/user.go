package http

import (
	"event-management-system/backend/internal/usecase/query"
	"net/http"
	"strconv"

	"event-management-system/backend/internal/domain/model"

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

// ListUsers はユーザー一覧取得エンドポイント
func (h *UserHandler) ListUsers(c *gin.Context) {
	role := c.Query("role")
	generationStr := c.Query("generation")
	generation, err := strconv.Atoi(generationStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid generation"})
		return
	}

	users, err := h.userQueryUsecase.ListUsers(c.Request.Context(), role, generation)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
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
		// ユーザーがいなければ新規作成
		generation := c.GetInt("user_generation")
		if generation == 0 {
			generation = 1
		}
		newUser := &model.User{
			UserID:     userID,
			Generation: generation,
			Roles:      []model.UserRole{}, // 必要ならデフォルトロール
		}
		if err := h.userQueryUsecase.UserRepo.Save(c.Request.Context(), newUser); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
			return
		}
		user, _ = h.userQueryUsecase.GetUser(c.Request.Context(), userID)
		c.JSON(http.StatusOK, user)
		return
	}

	c.JSON(http.StatusOK, user)
}

// RegisterRoutes はユーザー関連のルートを登録
func (h *UserHandler) RegisterRoutes(r *gin.Engine) {
	users := r.Group("/api/users")
	{
		users.GET("", h.ListUsers)
		users.GET("/me", h.GetCurrentUser)
		users.GET("/:id", h.GetUser)
	}
}
