package query

import (
	"context"

	"github.com/event-management-system/backend/internal/domain/aggregate"
	"github.com/event-management-system/backend/internal/domain/repository"
)

// ListEventsQuery はイベント一覧取得のクエリを表します
// CQRSパターンに従い、読み取り操作をクエリとして定義します
type ListEventsQuery struct {
	Status *aggregate.EventStatus `json:"status,omitempty"`
}

// EventDTO はイベントのデータ転送オブジェクトです
// クエリ結果を表現するためのシンプルな構造体です
type EventDTO struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	StartDate   string    `json:"start_date"`
	EndDate     string    `json:"end_date"`
	Status      string    `json:"status"`
	CreatedAt   string    `json:"created_at"`
	UpdatedAt   string    `json:"updated_at"`
}

// ListEventsQueryHandler はイベント一覧取得クエリを処理します
// アプリケーション層のクエリハンドラを実装します
type ListEventsQueryHandler struct {
	eventRepo repository.EventRepository
}

// NewListEventsQueryHandler は新しいクエリハンドラを作成します
func NewListEventsQueryHandler(eventRepo repository.EventRepository) *ListEventsQueryHandler {
	return &ListEventsQueryHandler{
		eventRepo: eventRepo,
	}
}

// Handle はイベント一覧取得クエリを処理します
// リポジトリからデータを取得し、DTOに変換して返します
func (h *ListEventsQueryHandler) Handle(ctx context.Context, query ListEventsQuery) ([]EventDTO, error) {
	var events []*aggregate.Event
	var err error

	// ステータスフィルターがある場合は適用
	if query.Status != nil {
		events, err = h.eventRepo.FindByStatus(ctx, *query.Status)
	} else {
		events, err = h.eventRepo.FindAll(ctx)
	}

	if err != nil {
		return nil, err
	}

	// ドメインオブジェクトをDTOに変換
	dtos := make([]EventDTO, len(events))
	for i, event := range events {
		dtos[i] = EventDTO{
			ID:          event.ID,
			Name:        event.Name,
			Description: event.Description,
			StartDate:   event.StartDate.Format("2006-01-02T15:04:05Z"),
			EndDate:     event.EndDate.Format("2006-01-02T15:04:05Z"),
			Status:      string(event.Status),
			CreatedAt:   event.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:   event.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		}
	}

	return dtos, nil
} 