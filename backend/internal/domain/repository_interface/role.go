package repository_interface

import (
	"context"
	"event-management-system/backend/internal/domain/model"
)

// RoleRepository は役割集約の永続化を担当するリポジトリインターフェースです
type RoleRepository interface {
	// FindByName は指定された名前の役割を取得します
	FindByName(ctx context.Context, name string) (*model.Role, error)

	// FindAll は全ての役割を取得します
	FindAll(ctx context.Context) ([]*model.Role, error)

	// Save は役割情報を保存または更新します
	Save(ctx context.Context, role *model.Role) error

	// Delete は役割を削除します
	Delete(ctx context.Context, name string) error

	// Exists は指定された名前の役割が存在するかチェックします
	Exists(ctx context.Context, name string) (bool, error)

	// FindUsersByRole は指定された役割を持つユーザー一覧を取得します
	FindUsersByRole(ctx context.Context, roleName string) ([]*model.User, error)
}
