package aggregate

import (
	"fmt"
)

// User はシステムを利用するユーザーを表す集約です
type User struct {
	userID     string
	name       string
	role       string
	generation string
}

// NewUser は新しいUserを作成します
func NewUser(userID, name, role, generation string) (*User, error) {
	if userID == "" {
		return nil, fmt.Errorf("user ID cannot be empty")
	}
	if name == "" {
		return nil, fmt.Errorf("name cannot be empty")
	}
	if role == "" {
		return nil, fmt.Errorf("role cannot be empty")
	}
	if generation == "" {
		return nil, fmt.Errorf("generation cannot be empty")
	}

	return &User{
		userID:     userID,
		name:       name,
		role:       role,
		generation: generation,
	}, nil
}

// UserID はユーザーIDを返します
func (u *User) UserID() string {
	return u.userID
}

// Name はユーザー名を返します
func (u *User) Name() string {
	return u.name
}

// Role はユーザーの役割を返します
func (u *User) Role() string {
	return u.role
}

// Generation はユーザーの世代を返します
func (u *User) Generation() string {
	return u.generation
}

// HasRole は指定された役割を持っているかどうかをチェックします
func (u *User) HasRole(role string) bool {
	return u.role == role
}

// HasAnyRole は指定された役割のいずれかを持っているかどうかをチェックします
func (u *User) HasAnyRole(roles []string) bool {
	for _, role := range roles {
		if u.role == role {
			return true
		}
	}
	return false
}

// String はUserの文字列表現を返します
func (u *User) String() string {
	return fmt.Sprintf("User{ID: %s, Name: %s, Role: %s, Generation: %s}", u.userID, u.name, u.role, u.generation)
} 