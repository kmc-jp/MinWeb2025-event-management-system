package http

import (
	"event-management-system/backend/internal/domain/model"
	"event-management-system/backend/internal/usecase/command"
	"event-management-system/backend/internal/usecase/query"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// EventHandler はイベント関連のHTTPハンドラ
type EventHandler struct {
	eventCommandUsecase *command.EventCommandUsecase
	eventQueryUsecase   *query.EventQueryUsecase
}

// NewEventHandler は新しいイベントハンドラを作成
func NewEventHandler(ecu *command.EventCommandUsecase, equ *query.EventQueryUsecase) *EventHandler {
	return &EventHandler{
		eventCommandUsecase: ecu,
		eventQueryUsecase:   equ,
	}
}

// CreateEventRequest はイベント作成リクエスト
type CreateEventRequest struct {
	Title          string             `json:"title" binding:"required"`
	Description    string             `json:"description"`
	Venue          string             `json:"venue"`
	AllowedRoles   []model.UserRole   `json:"allowed_roles"`
	AllowedUsers   []string           `json:"allowed_users"`
	Tags           []string           `json:"tags"`
	FeeSettings    []model.FeeSetting `json:"fee_settings"`
	PollType       string             `json:"poll_type"`
	PollCandidates []string           `json:"poll_candidates"` // ISO 8601形式の日時文字列
}

// CreateEvent はイベント作成エンドポイント
func (h *EventHandler) CreateEvent(c *gin.Context) {
	var req CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 認証情報からユーザーIDを取得（開発用にダミーユーザーIDを使用）
	organizerID := c.GetString("user_id")
	if organizerID == "" {
		// 開発用：認証が実装されていない場合はダミーユーザーIDを使用
		organizerID = "dummy-user-001"
	}

	// 日時文字列をtime.Timeに変換
	pollCandidates := make([]time.Time, len(req.PollCandidates))
	for i, dateStr := range req.PollCandidates {
		date, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format"})
			return
		}
		pollCandidates[i] = date
	}

	// タグをmodel.Tagに変換
	tags := make([]model.Tag, len(req.Tags))
	for i, tag := range req.Tags {
		tags[i] = model.Tag(tag)
	}

	cmd := &command.CreateEventCommand{
		OrganizerID:    organizerID,
		Title:          req.Title,
		Description:    req.Description,
		Venue:          req.Venue,
		AllowedRoles:   req.AllowedRoles,
		AllowedUsers:   req.AllowedUsers,
		Tags:           tags,
		FeeSettings:    req.FeeSettings,
		PollType:       req.PollType,
		PollCandidates: pollCandidates,
	}

	eventID, err := h.eventCommandUsecase.CreateEvent(c.Request.Context(), cmd)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"event_id": eventID})
}

// ListEventsRequest はイベント一覧取得リクエスト
type ListEventsRequest struct {
	Page     int    `form:"page" binding:"min=1"`
	PageSize int    `form:"page_size" binding:"min=1,max=100"`
	Status   string `form:"status"`
	Tags     string `form:"tags"` // カンマ区切り
}

// ListEvents はイベント一覧取得エンドポイント
func (h *EventHandler) ListEvents(c *gin.Context) {
	var req ListEventsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// デフォルト値設定
	if req.Page == 0 {
		req.Page = 1
	}
	if req.PageSize == 0 {
		req.PageSize = 20
	}

	query := &query.ListEventsQuery{
		Page:     req.Page,
		PageSize: req.PageSize,
	}

	// ステータスフィルタ
	if req.Status != "" {
		status := model.EventStatus(req.Status)
		query.StatusFilter = &status
	}

	// タグフィルタ
	if req.Tags != "" {
		// カンマ区切りのタグを解析
		// 実際の実装ではより詳細な解析が必要
	}

	result, err := h.eventQueryUsecase.ListEvents(c.Request.Context(), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetEventDetails はイベント詳細取得エンドポイント
func (h *EventHandler) GetEventDetails(c *gin.Context) {
	eventID := c.Param("id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	event, err := h.eventQueryUsecase.GetEventDetails(c.Request.Context(), eventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	c.JSON(http.StatusOK, event)
}

// RegisterRoutes はイベント関連のルートを登録
func (h *EventHandler) RegisterRoutes(r *gin.Engine) {
	events := r.Group("/api/events")
	{
		events.POST("", h.CreateEvent)
		events.GET("", h.ListEvents)
		events.GET("/:id", h.GetEventDetails)
	}
}
