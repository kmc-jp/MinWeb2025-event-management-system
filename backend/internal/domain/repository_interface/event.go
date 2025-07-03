package repository_interface

import (
	"context"

	"event-management-system/backend/internal/domain/model"
)

// EventRepository はイベント集約の永続化を担当するリポジトリインターフェースです
// クリーンアーキテクチャの依存性逆転の原則に従い、ドメイン層でインターフェースを定義します
type EventRepository interface {
	// Save はイベントを保存または更新します
	Save(ctx context.Context, event *model.Event) error

	// FindByID は指定されたIDのイベントを取得します
	FindByID(ctx context.Context, id string) (*model.Event, error)

	// FindAll は全てのイベントを取得します
	FindAll(ctx context.Context) ([]*model.Event, error)

	// FindByStatus は指定されたステータスのイベントを取得します
	FindByStatus(ctx context.Context, status model.EventStatus) ([]*model.Event, error)

	// Delete は指定されたIDのイベントを削除します
	Delete(ctx context.Context, id string) error
}
