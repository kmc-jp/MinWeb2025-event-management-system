package query

import (
	"context"
	"event-management-system/backend/internal/domain/repository"
	"event-management-system/backend/internal/domain/aggregate"
)

// ListEventsQuery はイベント一覧取得クエリです
type ListEventsQuery struct {
	Page       int    `json:"page"`
	PageSize   int    `json:"pageSize"`
	StatusFilter string `json:"statusFilter,omitempty"`
	TagFilter   string `json:"tagFilter,omitempty"`
}

// EventSummaryDTO はイベント概要のDTOです
type EventSummaryDTO struct {
	ID            string `json:"id"`
	Title         string `json:"title"`
	FinalizedDate *string `json:"finalizedDate,omitempty"`
	Status        string `json:"status"`
	OrganizerName string `json:"organizerName"`
}

// PaginatedEventSummary はページネーション付きイベント概要です
type PaginatedEventSummary struct {
	Events     []EventSummaryDTO `json:"events"`
	Pagination Pagination        `json:"pagination"`
}

// Pagination はページネーション情報です
type Pagination struct {
	Page      int `json:"page"`
	PageSize  int `json:"pageSize"`
	Total     int `json:"total"`
	TotalPages int `json:"totalPages"`
}

// ListEventsQueryHandler はイベント一覧取得クエリを処理します
type ListEventsQueryHandler struct {
	eventRepo repository.EventRepository
}

// NewListEventsQueryHandler は新しいListEventsQueryHandlerを作成します
func NewListEventsQueryHandler(eventRepo repository.EventRepository) *ListEventsQueryHandler {
	return &ListEventsQueryHandler{
		eventRepo: eventRepo,
	}
}

// Handle はクエリを実行します
func (h *ListEventsQueryHandler) Handle(ctx context.Context, query ListEventsQuery) (*PaginatedEventSummary, error) {
	// デフォルト値を設定
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 {
		query.PageSize = 20
	}

	// イベントを取得
	var events []*aggregate.Event
	var err error

	if query.StatusFilter != "" {
		events, err = h.eventRepo.FindByStatus(ctx, query.StatusFilter)
	} else {
		events, err = h.eventRepo.FindAll(ctx)
	}

	if err != nil {
		return nil, err
	}

	// タグフィルターを適用
	if query.TagFilter != "" {
		events = h.filterByTag(events, query.TagFilter)
	}

	// ページネーションを適用
	total := len(events)
	totalPages := (total + query.PageSize - 1) / query.PageSize

	start := (query.Page - 1) * query.PageSize
	end := start + query.PageSize
	if end > total {
		end = total
	}

	if start >= total {
		// ページが範囲外の場合、空の結果を返す
		return &PaginatedEventSummary{
			Events: []EventSummaryDTO{},
			Pagination: Pagination{
				Page:       query.Page,
				PageSize:   query.PageSize,
				Total:      total,
				TotalPages: totalPages,
			},
		}, nil
	}

	pagedEvents := events[start:end]

	// DTOに変換
	eventDTOs := make([]EventSummaryDTO, len(pagedEvents))
	for i, event := range pagedEvents {
		var finalizedDate *string
		if event.SchedulePoll().FinalizedDate() != nil {
			dateStr := event.SchedulePoll().FinalizedDate().Format("2006-01-02T15:04:05Z")
			finalizedDate = &dateStr
		}

		eventDTOs[i] = EventSummaryDTO{
			ID:            event.EventID(),
			Title:         event.Title(),
			FinalizedDate: finalizedDate,
			Status:        event.Status().String(),
			OrganizerName: event.Organizer().Name(),
		}
	}

	return &PaginatedEventSummary{
		Events: eventDTOs,
		Pagination: Pagination{
			Page:       query.Page,
			PageSize:   query.PageSize,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

// filterByTag はタグでイベントをフィルタリングします
func (h *ListEventsQueryHandler) filterByTag(events []*aggregate.Event, tagFilter string) []*aggregate.Event {
	var filtered []*aggregate.Event

	for _, event := range events {
		for _, tag := range event.Tags() {
			if tag == tagFilter {
				filtered = append(filtered, event)
				break
			}
		}
	}

	return filtered
} 