package query

import (
	"context"
	"event-management-system/backend/internal/domain/repository_interface"
)

// RoleDTO は役割表示用のDTO
type RoleDTO struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
	CreatedBy   string `json:"created_by"`
}

// RoleDetailsDTO は役割詳細表示用のDTO
type RoleDetailsDTO struct {
	Name        string            `json:"name"`
	Description string            `json:"description"`
	CreatedAt   string            `json:"created_at"`
	CreatedBy   string            `json:"created_by"`
	Users       []*UserSummaryDTO `json:"users"`
}

// UserSummaryDTO はユーザー概要表示用のDTO
type UserSummaryDTO struct {
	UserID     string `json:"user_id"`
	Name       string `json:"name"`
	Generation int    `json:"generation"`
}

// RoleQueryUsecase は役割クエリのユースケース
type RoleQueryUsecase struct {
	RoleRepo repository_interface.RoleRepository
}

// NewRoleQueryUsecase は新しい役割クエリユースケースを作成
func NewRoleQueryUsecase(rr repository_interface.RoleRepository) *RoleQueryUsecase {
	return &RoleQueryUsecase{RoleRepo: rr}
}

// GetAllRoles は全ての役割を取得
func (uc *RoleQueryUsecase) GetAllRoles(ctx context.Context) ([]*RoleDTO, error) {
	roles, err := uc.RoleRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	var dtos []*RoleDTO
	for _, role := range roles {
		dtos = append(dtos, &RoleDTO{
			Name:        role.Name,
			Description: role.Description,
			CreatedAt:   role.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			CreatedBy:   role.CreatedBy,
		})
	}

	return dtos, nil
}

// GetRoleByName は指定された名前の役割を取得
func (uc *RoleQueryUsecase) GetRoleByName(ctx context.Context, name string) (*RoleDTO, error) {
	role, err := uc.RoleRepo.FindByName(ctx, name)
	if err != nil {
		return nil, err
	}

	return &RoleDTO{
		Name:        role.Name,
		Description: role.Description,
		CreatedAt:   role.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		CreatedBy:   role.CreatedBy,
	}, nil
}

// GetRoleDetails は指定された名前の役割詳細を取得
func (uc *RoleQueryUsecase) GetRoleDetails(ctx context.Context, name string) (*RoleDetailsDTO, error) {
	role, err := uc.RoleRepo.FindByName(ctx, name)
	if err != nil {
		return nil, err
	}

	// この役割を持つユーザー一覧を取得
	users, err := uc.RoleRepo.FindUsersByRole(ctx, name)
	if err != nil {
		return nil, err
	}

	// ユーザー概要DTOに変換
	var userSummaries []*UserSummaryDTO
	for _, user := range users {
		userSummaries = append(userSummaries, &UserSummaryDTO{
			UserID:     user.UserID,
			Name:       user.Name,
			Generation: user.Generation,
		})
	}

	return &RoleDetailsDTO{
		Name:        role.Name,
		Description: role.Description,
		CreatedAt:   role.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		CreatedBy:   role.CreatedBy,
		Users:       userSummaries,
	}, nil
}
