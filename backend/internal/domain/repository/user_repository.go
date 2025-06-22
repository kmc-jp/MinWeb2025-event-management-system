package repository

import (
	"context"
	"event-management-system/backend/internal/domain/aggregate"
)

// UserRepository はユーザー集約の永続化を担当するリポジトリインターフェースです
type UserRepository interface {
	// Save はユーザーを保存します
	Save(ctx context.Context, user *aggregate.User) error

	// FindByID は指定されたIDのユーザーを取得します
	FindByID(ctx context.Context, userID string) (*aggregate.User, error)

	// FindAll はすべてのユーザーを取得します
	FindAll(ctx context.Context) ([]*aggregate.User, error)

	// FindByRole は指定された役割のユーザーを取得します
	FindByRole(ctx context.Context, role string) ([]*aggregate.User, error)

	// FindByGeneration は指定された世代のユーザーを取得します
	FindByGeneration(ctx context.Context, generation string) ([]*aggregate.User, error)

	// Delete はユーザーを削除します
	Delete(ctx context.Context, userID string) error
} 