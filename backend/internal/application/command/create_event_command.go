package command

import (
	"context"
	"time"

	"event-management-system/backend/internal/domain/aggregate"
	"event-management-system/backend/internal/domain/repository"
)

// CreateEventCommand はイベント作成のコマンドを表します
// CQRSパターンに従い、書き込み操作をコマンドとして定義します
type CreateEventCommand struct {
	Name        string    `json:"name" validate:"required"`
	Description string    `json:"description"`
	StartDate   time.Time `json:"start_date" validate:"required"`
	EndDate     time.Time `json:"end_date" validate:"required"`
}

// CreateEventCommandHandler はイベント作成コマンドを処理します
// アプリケーション層のユースケースを実装します
type CreateEventCommandHandler struct {
	eventRepo repository.EventRepository
}

// NewCreateEventCommandHandler は新しいコマンドハンドラを作成します
func NewCreateEventCommandHandler(eventRepo repository.EventRepository) *CreateEventCommandHandler {
	return &CreateEventCommandHandler{
		eventRepo: eventRepo,
	}
}

// Handle はイベント作成コマンドを処理します
// ドメインロジックをオーケストレーションし、リポジトリを通じて永続化します
func (h *CreateEventCommandHandler) Handle(ctx context.Context, cmd CreateEventCommand) (*aggregate.Event, error) {
	// ドメインロジックを使用してイベントを作成
	event, err := aggregate.NewEvent(cmd.Name, cmd.Description, cmd.StartDate, cmd.EndDate)
	if err != nil {
		return nil, err
	}

	// リポジトリを通じて永続化
	if err := h.eventRepo.Save(ctx, event); err != nil {
		return nil, err
	}

	return event, nil
} 