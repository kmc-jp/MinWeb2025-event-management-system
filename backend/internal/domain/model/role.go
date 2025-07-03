package model

import (
	"time"
)

// Role はシステム内の役割を表します
type Role struct {
	Name             string    // 役割名
	Description      string    // 役割の説明
	CreatedAt        time.Time // 作成日時
	CreatedBy        string    // 作成者ID
	AllowedAssigners []string  // この役割を付与できるユーザーIDのリスト
}

// NewRole は新しい役割を作成します
func NewRole(name, description, createdBy string) *Role {
	return &Role{
		Name:             name,
		Description:      description,
		CreatedAt:        time.Now(),
		CreatedBy:        createdBy,
		AllowedAssigners: []string{createdBy}, // 作成者は自動的に付与権限を持つ
	}
}

// CanAssign は指定されたユーザーがこの役割を付与できるかチェックします
func (r *Role) CanAssign(userID string, userRoles []UserRole) bool {
	// adminは全ての役割を付与可能
	for _, role := range userRoles {
		if role == UserRoleAdmin {
			return true
		}
	}

	// 作成者または許可されたユーザーは付与可能
	for _, allowedUser := range r.AllowedAssigners {
		if allowedUser == userID {
			return true
		}
	}

	return false
}

// CanEdit は指定されたユーザーがこの役割を編集できるかチェックします
func (r *Role) CanEdit(userID string, userRoles []UserRole) bool {
	// adminは全ての役割を編集可能
	for _, role := range userRoles {
		if role == UserRoleAdmin {
			return true
		}
	}

	// 作成者は編集可能
	return r.CreatedBy == userID
}

// CanDelete は指定されたユーザーがこの役割を削除できるかチェックします
func (r *Role) CanDelete(userID string, userRoles []UserRole) bool {
	// adminとmemberは削除不可
	if r.Name == "admin" || r.Name == "member" {
		return false
	}

	// adminは全ての役割を削除可能（adminとmember以外）
	for _, role := range userRoles {
		if role == UserRoleAdmin {
			return true
		}
	}

	// 作成者は削除可能（adminとmember以外）
	return r.CreatedBy == userID
}

// AddAllowedAssigner は役割の付与権限を持つユーザーを追加します
func (r *Role) AddAllowedAssigner(userID string) {
	// 既に存在するかチェック
	for _, existing := range r.AllowedAssigners {
		if existing == userID {
			return
		}
	}
	r.AllowedAssigners = append(r.AllowedAssigners, userID)
}

// RemoveAllowedAssigner は役割の付与権限を持つユーザーを削除します
func (r *Role) RemoveAllowedAssigner(userID string) {
	for i, existing := range r.AllowedAssigners {
		if existing == userID {
			r.AllowedAssigners = append(r.AllowedAssigners[:i], r.AllowedAssigners[i+1:]...)
			return
		}
	}
}
