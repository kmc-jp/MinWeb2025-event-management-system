package query

import (
	"context"
	"event-management-system/backend/internal/domain/model"
	"event-management-system/backend/internal/domain/repository_interface"
	"time"
)

// EventSummaryDTO はイベント一覧表示用のDTO
type EventSummaryDTO struct {
	EventID                   string            `json:"event_id"`
	Title                     string            `json:"title"`
	Status                    model.EventStatus `json:"status"`
	Venue                     string            `json:"venue"`
	Organizer                 string            `json:"organizer_name"`
	AllowedParticipationRoles []model.UserRole  `json:"allowed_participation_roles"`
	Tags                      []model.Tag       `json:"tags"`
	ConfirmedDate             *string           `json:"confirmed_date,omitempty"`
	ScheduleDeadline          *string           `json:"schedule_deadline,omitempty"`
	CreatedAt                 string            `json:"created_at"`
}

// EventDetailsDTO はイベント詳細表示用のDTO
type EventDetailsDTO struct {
	EventID                   string             `json:"event_id"`
	Title                     string             `json:"title"`
	Description               string             `json:"description"`
	Status                    model.EventStatus  `json:"status"`
	Venue                     string             `json:"venue"`
	AllowedParticipationRoles []model.UserRole   `json:"allowed_participation_roles"`
	AllowedEditRoles          []model.UserRole   `json:"allowed_edit_roles"`
	Tags                      []model.Tag        `json:"tags"`
	FeeSettings               []model.FeeSetting `json:"fee_settings"`
	ConfirmedDate             *string            `json:"confirmed_date,omitempty"`
	ScheduleDeadline          *string            `json:"schedule_deadline,omitempty"`
	Organizer                 string             `json:"organizer_name"`
	CreatedAt                 string             `json:"created_at"`
	UpdatedAt                 string             `json:"updated_at"`
}

// EventParticipantDTO はイベント参加者表示用のDTO
type EventParticipantDTO struct {
	UserID     string `json:"user_id"`
	Generation int    `json:"generation"`
	JoinedAt   string `json:"joined_at"`
}

// ListEventsQuery はイベント一覧取得のクエリ
type ListEventsQuery struct {
	Page                int
	PageSize            int
	StatusFilter        *model.EventStatus
	TagFilter           []model.Tag
	ParticipationFilter string // "all", "joinable", "joined"
	UserID              string // 参加状況フィルタ用のユーザーID
}

// PaginatedResult はページネーション結果
type PaginatedResult[T any] struct {
	Data       []T `json:"data"`
	TotalCount int `json:"total_count"`
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
}

// EventQueryUsecase はイベントクエリのユースケース
type EventQueryUsecase struct {
	EventRepo repository_interface.EventRepository
	UserRepo  repository_interface.UserRepository
}

// NewEventQueryUsecase は新しいイベントクエリユースケースを作成
func NewEventQueryUsecase(er repository_interface.EventRepository, ur repository_interface.UserRepository) *EventQueryUsecase {
	return &EventQueryUsecase{EventRepo: er, UserRepo: ur}
}

// ListEvents はイベント一覧を取得
func (uc *EventQueryUsecase) ListEvents(ctx context.Context, query *ListEventsQuery) (*PaginatedResult[EventSummaryDTO], error) {
	events, err := uc.EventRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	// フィルタリング
	filteredEvents := uc.filterEvents(events, query.StatusFilter, query.TagFilter, query.ParticipationFilter, query.UserID)

	// ページネーション
	start := (query.Page - 1) * query.PageSize
	end := start + query.PageSize
	if end > len(filteredEvents) {
		end = len(filteredEvents)
	}
	if start >= len(filteredEvents) {
		start = len(filteredEvents)
	}

	pagedEvents := filteredEvents[start:end]

	// DTO変換
	dtos := make([]EventSummaryDTO, len(pagedEvents))
	for i, event := range pagedEvents {
		var confirmedDate *string
		if event.ConfirmedDate != nil {
			dateStr := event.ConfirmedDate.Format("2006-01-02T15:04:05Z")
			confirmedDate = &dateStr
		}

		var scheduleDeadline *string
		if event.ScheduleDeadline != nil {
			dateStr := event.ScheduleDeadline.Format("2006-01-02T15:04:05Z")
			scheduleDeadline = &dateStr
		}

		dtos[i] = EventSummaryDTO{
			EventID:                   event.EventID,
			Title:                     event.Title,
			Status:                    event.Status,
			Venue:                     event.Venue,
			Organizer:                 event.Organizer.UserID,
			AllowedParticipationRoles: event.AllowedParticipationRoles,
			Tags:                      event.Tags,
			ConfirmedDate:             confirmedDate,
			ScheduleDeadline:          scheduleDeadline,
			CreatedAt:                 event.CreatedAt.Format("2006-01-02T15:04:05Z"),
		}
	}

	return &PaginatedResult[EventSummaryDTO]{
		Data:       dtos,
		TotalCount: len(filteredEvents),
		Page:       query.Page,
		PageSize:   query.PageSize,
	}, nil
}

// GetEventParticipants はイベント参加者一覧を取得
func (uc *EventQueryUsecase) GetEventParticipants(ctx context.Context, eventID string) ([]EventParticipantDTO, error) {
	participants, err := uc.EventRepo.GetEventParticipants(ctx, eventID)
	if err != nil {
		return nil, err
	}

	dtos := make([]EventParticipantDTO, len(participants))
	for i, participant := range participants {
		dtos[i] = EventParticipantDTO{
			UserID:     participant.UserID,
			Generation: participant.Generation,
			JoinedAt:   participant.JoinedAt.Format("2006-01-02T15:04:05Z"),
		}
	}

	return dtos, nil
}

// GetEventDetails はイベント詳細を取得
func (uc *EventQueryUsecase) GetEventDetails(ctx context.Context, eventID string) (*EventDetailsDTO, error) {
	event, err := uc.EventRepo.FindByID(ctx, eventID)
	if err != nil {
		return nil, err
	}

	var confirmedDate *string
	if event.ConfirmedDate != nil {
		dateStr := event.ConfirmedDate.Format("2006-01-02T15:04:05Z")
		confirmedDate = &dateStr
	}

	var scheduleDeadline *string
	if event.ScheduleDeadline != nil {
		dateStr := event.ScheduleDeadline.Format("2006-01-02T15:04:05Z")
		scheduleDeadline = &dateStr
	}

	return &EventDetailsDTO{
		EventID:                   event.EventID,
		Title:                     event.Title,
		Description:               event.Description,
		Status:                    event.Status,
		Venue:                     event.Venue,
		AllowedParticipationRoles: event.AllowedParticipationRoles,
		AllowedEditRoles:          event.AllowedEditRoles,
		Tags:                      event.Tags,
		FeeSettings:               event.FeeSettings,
		ConfirmedDate:             confirmedDate,
		ScheduleDeadline:          scheduleDeadline,
		Organizer:                 event.Organizer.UserID,
		CreatedAt:                 event.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:                 event.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}, nil
}

// filterEvents はイベントをフィルタリング
func (uc *EventQueryUsecase) filterEvents(events []*model.Event, statusFilter *model.EventStatus, tagFilter []model.Tag, participationFilter string, userID string) []*model.Event {
	var filtered []*model.Event

	for _, event := range events {
		// ステータスフィルタ
		if statusFilter != nil && event.Status != *statusFilter {
			continue
		}

		// タグフィルタ
		if len(tagFilter) > 0 {
			hasTag := false
			for _, filterTag := range tagFilter {
				for _, eventTag := range event.Tags {
					if filterTag == eventTag {
						hasTag = true
						break
					}
				}
				if hasTag {
					break
				}
			}
			if !hasTag {
				continue
			}
		}

		// 参加状況フィルタ
		if participationFilter != "" && participationFilter != "all" && userID != "" {
			// ユーザー情報を取得
			user, err := uc.UserRepo.FindByID(context.Background(), userID)
			if err != nil {
				continue // ユーザーが見つからない場合はスキップ
			}

			if participationFilter == "joinable" {
				// 参加可能な役割を持っているかチェック
				hasJoinableRole := false
				for _, userRole := range user.Roles {
					for _, allowedRole := range event.AllowedParticipationRoles {
						if userRole == allowedRole {
							hasJoinableRole = true
							break
						}
					}
					if hasJoinableRole {
						break
					}
				}
				if !hasJoinableRole {
					continue
				}

				// イベントステータスのチェック（終了済み、キャンセル済みは参加不可）
				if event.Status == model.EventStatusFinished || event.Status == model.EventStatusCancelled {
					continue
				}

				// 日程のチェック（過去のイベントは参加不可）
				if event.ConfirmedDate != nil {
					now := time.Now()
					if event.ConfirmedDate.Before(now) {
						continue
					}
				}

				// 既に参加済みかチェック（参加済みの場合はjoinableに含めない）
				participants, err := uc.EventRepo.GetEventParticipants(context.Background(), event.EventID)
				if err != nil {
					continue
				}
				for _, participant := range participants {
					if participant.UserID == userID {
						continue // 既に参加済みの場合はスキップ
					}
				}
			} else if participationFilter == "joined" {
				// 参加済みかチェック
				participants, err := uc.EventRepo.GetEventParticipants(context.Background(), event.EventID)
				if err != nil {
					continue
				}
				isJoined := false
				for _, participant := range participants {
					if participant.UserID == userID {
						isJoined = true
						break
					}
				}
				if !isJoined {
					continue
				}
			}
		}

		filtered = append(filtered, event)
	}

	return filtered
}
