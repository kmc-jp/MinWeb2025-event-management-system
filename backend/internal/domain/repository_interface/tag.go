package repository_interface

import (
	"context"
	"errors"
	"event-management-system/backend/internal/domain/model"
)

// ErrTagNotFound はタグが見つからないエラー
var ErrTagNotFound = errors.New("tag not found")

// TagRepository はタグ集約の永続化を担当するリポジトリインターフェースです
type TagRepository interface {
	// FindAll は全てのタグを取得します
	FindAll(ctx context.Context) ([]*model.TagEntity, error)

	// FindByName は指定された名前のタグを取得します
	FindByName(ctx context.Context, name string) (*model.TagEntity, error)

	// Save はタグ情報を保存または更新します
	Save(ctx context.Context, tag *model.TagEntity) error

	// Exists は指定された名前のタグが存在するかチェックします
	Exists(ctx context.Context, name string) (bool, error)
}
