package http

import (
	"net/http"
	"strings"

	"event-management-system/backend/internal/usecase/command"
	"event-management-system/backend/internal/usecase/query"

	"github.com/gin-gonic/gin"
)

// TagHandler はタグ関連のHTTPハンドラー
type TagHandler struct {
	tagCommandUsecase *command.TagCommandUsecase
	tagQueryUsecase   *query.TagQueryUsecase
}

// NewTagHandler は新しいタグハンドラーを作成
func NewTagHandler(tcu *command.TagCommandUsecase, tqu *query.TagQueryUsecase) *TagHandler {
	return &TagHandler{
		tagCommandUsecase: tcu,
		tagQueryUsecase:   tqu,
	}
}

// CreateTagRequest はタグ作成リクエスト
type CreateTagRequest struct {
	Name string `json:"name" binding:"required"`
}

// RegisterRoutes はタグ関連のルートを登録
func (h *TagHandler) RegisterRoutes(r *gin.Engine) {
	tags := r.Group("/api/tags")
	{
		tags.GET("", h.ListTags)
		tags.POST("", h.CreateTag)
	}
}

// ListTags は全てのタグを取得
func (h *TagHandler) ListTags(c *gin.Context) {
	tags, err := h.tagQueryUsecase.GetAllTags(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tags)
}

// CreateTag は新しいタグを作成
func (h *TagHandler) CreateTag(c *gin.Context) {
	// 認証情報を取得（簡易実装）
	userID := c.GetString("user_id")
	if userID == "" {
		// 開発用：認証が実装されていない場合はダミーユーザーIDを使用
		userID = "dummy-user-001"
	}

	var req CreateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cmd := &command.CreateTagCommand{
		Name:      req.Name,
		CreatedBy: userID,
	}

	if err := h.tagCommandUsecase.CreateTag(c.Request.Context(), cmd); err != nil {
		if strings.Contains(err.Error(), "already exists") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// 作成されたタグを取得して返す
	tags, err := h.tagQueryUsecase.GetAllTags(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 作成されたタグを探す
	for _, tag := range tags {
		if tag.Name == req.Name {
			c.JSON(http.StatusCreated, tag)
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"name": req.Name, "created_by": userID})
}
