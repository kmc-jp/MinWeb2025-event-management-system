package http

import (
	"context"
	"errors"
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
	userQueryUsecase    *query.UserQueryUsecase
}

// NewEventHandler は新しいイベントハンドラを作成
func NewEventHandler(ecu *command.EventCommandUsecase, equ *query.EventQueryUsecase, uqu *query.UserQueryUsecase) *EventHandler {
	return &EventHandler{
		eventCommandUsecase: ecu,
		eventQueryUsecase:   equ,
		userQueryUsecase:    uqu,
	}
}

// CreateEventRequest はイベント作成リクエスト
type CreateEventRequest struct {
	Title            string             `json:"title" binding:"required"`
	Description      string             `json:"description"`
	Venue            string             `json:"venue"`
	AllowedRoles     []model.UserRole   `json:"allowed_roles"`
	EditableRoles    []model.UserRole   `json:"editable_roles"`
	AllowedUsers     []string           `json:"allowed_users"`
	Tags             []string           `json:"tags"`
	FeeSettings      []model.FeeSetting `json:"fee_settings"`
	PollType         string             `json:"poll_type"`
	PollCandidates   []string           `json:"poll_candidates"`   // ISO 8601形式の日時文字列
	ConfirmedDate    *string            `json:"confirmed_date"`    // 確定した日程（ISO 8601形式）
	ScheduleDeadline *string            `json:"schedule_deadline"` // 日程確定予定日（ISO 8601形式）
}

// UpdateEventRequest はイベント更新リクエスト
type UpdateEventRequest struct {
	Title         string             `json:"title" binding:"required"`
	Description   string             `json:"description"`
	Venue         string             `json:"venue"`
	AllowedRoles  []model.UserRole   `json:"allowed_roles"`
	EditableRoles []model.UserRole   `json:"editable_roles"`
	Tags          []string           `json:"tags"`
	FeeSettings   []model.FeeSetting `json:"fee_settings"`
}

// JoinEventRequest はイベント参加リクエスト
type JoinEventRequest struct {
	UserID string `json:"user_id" binding:"required"`
}

// hasEditPermission はユーザーがイベントを編集する権限があるかチェックします
func (h *EventHandler) hasEditPermission(ctx context.Context, userID string, editableRoles []model.UserRole) error {
	// ユーザー情報を取得
	user, err := h.userQueryUsecase.GetUser(ctx, userID)
	if err != nil {
		return err
	}

	// イベントの編集可能な役割とユーザーの役割を比較
	for _, userRole := range user.Roles {
		for _, editableRole := range editableRoles {
			if userRole == editableRole {
				return nil // 権限あり
			}
		}
	}

	return errors.New("insufficient permissions to edit this event")
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

	// イベント作成権限チェック（admin役割を持つユーザーのみ作成可能）
	user, err := h.userQueryUsecase.GetUser(c.Request.Context(), organizerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	hasAdminRole := false
	for _, role := range user.Roles {
		if role == model.UserRoleAdmin {
			hasAdminRole = true
			break
		}
	}

	if !hasAdminRole {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions to create events"})
		return
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

	// 日程情報を処理
	var confirmedDate *time.Time
	if req.ConfirmedDate != nil {
		date, err := time.Parse(time.RFC3339, *req.ConfirmedDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid confirmed_date format"})
			return
		}
		confirmedDate = &date
	}

	var scheduleDeadline *time.Time
	if req.ScheduleDeadline != nil {
		date, err := time.Parse(time.RFC3339, *req.ScheduleDeadline)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid schedule_deadline format"})
			return
		}
		scheduleDeadline = &date
	}

	cmd := &command.CreateEventCommand{
		OrganizerID:      organizerID,
		Title:            req.Title,
		Description:      req.Description,
		Venue:            req.Venue,
		AllowedRoles:     req.AllowedRoles,
		EditableRoles:    req.EditableRoles,
		AllowedUsers:     req.AllowedUsers,
		Tags:             tags,
		FeeSettings:      req.FeeSettings,
		PollType:         req.PollType,
		PollCandidates:   pollCandidates,
		ConfirmedDate:    confirmedDate,
		ScheduleDeadline: scheduleDeadline,
	}

	eventID, err := h.eventCommandUsecase.CreateEvent(c.Request.Context(), cmd)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"event_id": eventID})
}

// UpdateEvent はイベント更新エンドポイント
func (h *EventHandler) UpdateEvent(c *gin.Context) {
	eventID := c.Param("id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	var req UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 認証情報からユーザーIDを取得
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "dummy-user-001"
	}

	// イベント詳細を取得
	event, err := h.eventQueryUsecase.GetEventDetails(c.Request.Context(), eventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	// 編集権限チェック
	if err := h.hasEditPermission(c.Request.Context(), userID, event.EditableRoles); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	// タグをmodel.Tagに変換
	tags := make([]model.Tag, len(req.Tags))
	for i, tag := range req.Tags {
		tags[i] = model.Tag(tag)
	}

	cmd := &command.UpdateEventCommand{
		EventID:       eventID,
		Title:         req.Title,
		Description:   req.Description,
		Venue:         req.Venue,
		AllowedRoles:  req.AllowedRoles,
		EditableRoles: req.EditableRoles,
		Tags:          tags,
		FeeSettings:   req.FeeSettings,
	}

	if err := h.eventCommandUsecase.UpdateEvent(c.Request.Context(), cmd); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 更新後のイベント詳細を返す
	updatedEvent, err := h.eventQueryUsecase.GetEventDetails(c.Request.Context(), eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedEvent)
}

// DeleteEvent はイベント削除エンドポイント
func (h *EventHandler) DeleteEvent(c *gin.Context) {
	eventID := c.Param("id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	// 認証情報からユーザーIDを取得
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "dummy-user-001"
	}

	// イベント詳細を取得
	event, err := h.eventQueryUsecase.GetEventDetails(c.Request.Context(), eventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	// 削除権限チェック
	if err := h.hasEditPermission(c.Request.Context(), userID, event.EditableRoles); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	cmd := &command.DeleteEventCommand{
		EventID: eventID,
	}

	if err := h.eventCommandUsecase.DeleteEvent(c.Request.Context(), cmd); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
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

// ListEventParticipants はイベント参加者一覧取得エンドポイント
func (h *EventHandler) ListEventParticipants(c *gin.Context) {
	eventID := c.Param("id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	participants, err := h.eventQueryUsecase.GetEventParticipants(c.Request.Context(), eventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	c.JSON(http.StatusOK, participants)
}

// JoinEvent はイベント参加エンドポイント
func (h *EventHandler) JoinEvent(c *gin.Context) {
	eventID := c.Param("id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	var req JoinEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cmd := &command.JoinEventCommand{
		EventID: eventID,
		UserID:  req.UserID,
	}

	if err := h.eventCommandUsecase.JoinEvent(c.Request.Context(), cmd); err != nil {
		if err.Error() == "user already joined the event" {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "user does not have required roles to join this event" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 参加後の参加者情報を返す
	participants, err := h.eventQueryUsecase.GetEventParticipants(c.Request.Context(), eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 新しく参加したユーザーを探す
	for _, participant := range participants {
		if participant.UserID == req.UserID {
			c.JSON(http.StatusCreated, participant)
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Successfully joined the event"})
}

// LeaveEvent はイベント退出エンドポイント
func (h *EventHandler) LeaveEvent(c *gin.Context) {
	eventID := c.Param("id")
	userID := c.Param("userId")
	if eventID == "" || userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id and userId are required"})
		return
	}

	cmd := &command.LeaveEventCommand{
		EventID: eventID,
		UserID:  userID,
	}

	if err := h.eventCommandUsecase.LeaveEvent(c.Request.Context(), cmd); err != nil {
		if err.Error() == "user not found in participants" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// RegisterRoutes はイベント関連のルートを登録
func (h *EventHandler) RegisterRoutes(r *gin.Engine) {
	events := r.Group("/api/events")
	{
		events.POST("", h.CreateEvent)
		events.GET("", h.ListEvents)
		events.GET("/:id", h.GetEventDetails)
		events.PUT("/:id", h.UpdateEvent)
		events.DELETE("/:id", h.DeleteEvent)

		// イベント参加機能のルート
		events.GET("/:id/participants", h.ListEventParticipants)
		events.POST("/:id/participants", h.JoinEvent)
		events.DELETE("/:id/participants/:userId", h.LeaveEvent)
	}
}
