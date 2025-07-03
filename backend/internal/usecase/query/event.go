package query

import (
	"context"
	"event-management-system/backend/internal/domain/model"
	"event-management-system/backend/internal/domain/repository_interface"
)

// EventSummaryDTO はイベント一覧表示用のDTO
type EventSummaryDTO struct {
	EventID          string            `json:"event_id"`
	Title            string            `json:"title"`
	Status           model.EventStatus `json:"status"`
	Venue            string            `json:"venue"`
	Organizer        string            `json:"organizer_name"`
	ConfirmedDate    *string           `json:"confirmed_date,omitempty"`
	ScheduleDeadline *string           `json:"schedule_deadline,omitempty"`
	CreatedAt        string            `json:"created_at"`
}

// EventDetailsDTO はイベント詳細表示用のDTO
type EventDetailsDTO struct {
	EventID          string             `json:"event_id"`
	Title            string             `json:"title"`
	Description      string             `json:"description"`
	Status           model.EventStatus  `json:"status"`
	Venue            string             `json:"venue"`
	AllowedRoles     []model.UserRole   `json:"allowed_roles"`
	Tags             []model.Tag        `json:"tags"`
	FeeSettings      []model.FeeSetting `json:"fee_settings"`
	ConfirmedDate    *string            `json:"confirmed_date,omitempty"`
	ScheduleDeadline *string            `json:"schedule_deadline,omitempty"`
	Organizer        string             `json:"organizer_name"`
	CreatedAt        string             `json:"created_at"`
	UpdatedAt        string             `json:"updated_at"`
}

// EventParticipantDTO はイベント参加者表示用のDTO
type EventParticipantDTO struct {
	UserID     string                    `json:"user_id"`
	Name       string                    `json:"name"`
	Generation int                       `json:"generation"`
	JoinedAt   string                    `json:"joined_at"`
	Status     model.ParticipationStatus `json:"status"`
}

// ListEventsQuery はイベント一覧取得のクエリ
type ListEventsQuery struct {
	Page         int
	PageSize     int
	StatusFilter *model.EventStatus
	TagFilter    []model.Tag
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
}

// NewEventQueryUsecase は新しいイベントクエリユースケースを作成
func NewEventQueryUsecase(er repository_interface.EventRepository) *EventQueryUsecase {
	return &EventQueryUsecase{EventRepo: er}
}

// ListEvents はイベント一覧を取得
func (uc *EventQueryUsecase) ListEvents(ctx context.Context, query *ListEventsQuery) (*PaginatedResult[EventSummaryDTO], error) {
	events, err := uc.EventRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	// フィルタリング
	filteredEvents := uc.filterEvents(events, query.StatusFilter, query.TagFilter)

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
			EventID:          event.EventID,
			Title:            event.Title,
			Status:           event.Status,
			Venue:            event.Venue,
			Organizer:        event.Organizer.Name,
			ConfirmedDate:    confirmedDate,
			ScheduleDeadline: scheduleDeadline,
			CreatedAt:        event.CreatedAt.Format("2006-01-02T15:04:05Z"),
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
			Name:       participant.Name,
			Generation: participant.Generation,
			JoinedAt:   participant.JoinedAt.Format("2006-01-02T15:04:05Z"),
			Status:     participant.Status,
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
		EventID:          event.EventID,
		Title:            event.Title,
		Description:      event.Description,
		Status:           event.Status,
		Venue:            event.Venue,
		AllowedRoles:     event.AllowedRoles,
		Tags:             event.Tags,
		FeeSettings:      event.FeeSettings,
		ConfirmedDate:    confirmedDate,
		ScheduleDeadline: scheduleDeadline,
		Organizer:        event.Organizer.Name,
		CreatedAt:        event.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:        event.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}, nil
}

// filterEvents はイベントをフィルタリング
func (uc *EventQueryUsecase) filterEvents(events []*model.Event, statusFilter *model.EventStatus, tagFilter []model.Tag) []*model.Event {
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

		filtered = append(filtered, event)
	}

	return filtered
}
