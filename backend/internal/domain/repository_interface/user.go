package repository_interface

import (
	"context"
	"event-management-system/backend/internal/domain/model"
)

// UserRepository はユーザー集約の永続化を担当するリポジトリインターフェースです
// 認証は外部サービスで行われるが、ユーザー情報の参照・保存用途で定義

type UserRepository interface {
	// FindByID は指定されたIDのユーザーを取得します
	FindByID(ctx context.Context, userID string) (*model.User, error)

	// Save はユーザー情報を保存または更新します
	Save(ctx context.Context, user *model.User) error
}
