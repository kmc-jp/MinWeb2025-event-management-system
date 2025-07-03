package query

import (
	"context"
	"event-management-system/backend/internal/domain/model"
	"event-management-system/backend/internal/domain/repository_interface"
)

// UserDTO はユーザー表示用のDTO
type UserDTO struct {
	UserID     string           `json:"user_id"`
	Name       string           `json:"name"`
	Roles      []model.UserRole `json:"roles"`
	Generation string           `json:"generation"`
}

// UserQueryUsecase はユーザークエリのユースケース
type UserQueryUsecase struct {
	UserRepo repository_interface.UserRepository
}

// NewUserQueryUsecase は新しいユーザークエリユースケースを作成
func NewUserQueryUsecase(ur repository_interface.UserRepository) *UserQueryUsecase {
	return &UserQueryUsecase{UserRepo: ur}
}

// GetUser はユーザー詳細を取得
func (uc *UserQueryUsecase) GetUser(ctx context.Context, userID string) (*UserDTO, error) {
	user, err := uc.UserRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &UserDTO{
		UserID:     user.UserID,
		Name:       user.Name,
		Roles:      user.Roles,
		Generation: user.Generation,
	}, nil
}

// ListUsers はユーザー一覧を取得
func (uc *UserQueryUsecase) ListUsers(ctx context.Context, role, generation string) ([]*UserSummaryDTO, error) {
	users, err := uc.UserRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	var filteredUsers []*UserSummaryDTO
	for _, user := range users {
		// 役割フィルタ
		if role != "" {
			hasRole := false
			for _, userRole := range user.Roles {
				if string(userRole) == role {
					hasRole = true
					break
				}
			}
			if !hasRole {
				continue
			}
		}

		// 世代フィルタ
		if generation != "" && user.Generation != generation {
			continue
		}

		filteredUsers = append(filteredUsers, &UserSummaryDTO{
			UserID:     user.UserID,
			Name:       user.Name,
			Generation: user.Generation,
		})
	}

	return filteredUsers, nil
}
