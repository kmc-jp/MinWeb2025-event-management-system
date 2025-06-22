package repository

import (
	"context"
	"event-management-system/backend/internal/domain/aggregate"
)

// EventRepository はイベント集約の永続化を担当するリポジトリインターフェースです
type EventRepository interface {
	// Save はイベントを保存します
	Save(ctx context.Context, event *aggregate.Event) error

	// FindByID は指定されたIDのイベントを取得します
	FindByID(ctx context.Context, eventID string) (*aggregate.Event, error)

	// FindAll はすべてのイベントを取得します
	FindAll(ctx context.Context) ([]*aggregate.Event, error)

	// FindByStatus は指定されたステータスのイベントを取得します
	FindByStatus(ctx context.Context, status string) ([]*aggregate.Event, error)

	// FindByOrganizer は指定された主催者のイベントを取得します
	FindByOrganizer(ctx context.Context, organizerID string) ([]*aggregate.Event, error)

	// FindByParticipant は指定された参加者が登録しているイベントを取得します
	FindByParticipant(ctx context.Context, userID string) ([]*aggregate.Event, error)

	// Delete はイベントを削除します
	Delete(ctx context.Context, eventID string) error
} 