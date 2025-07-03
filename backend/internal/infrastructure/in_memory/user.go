package in_memory

import (
	"context"
	"event-management-system/backend/internal/domain/model"
	"sync"
)

// InMemoryUserRepository はUserRepositoryのインメモリ実装
type InMemoryUserRepository struct {
	users map[string]*model.User
	mutex sync.RWMutex
}

// NewInMemoryUserRepository は新しいインメモリユーザーリポジトリを作成
func NewInMemoryUserRepository() *InMemoryUserRepository {
	return &InMemoryUserRepository{
		users: make(map[string]*model.User),
	}
}

// FindByID は指定されたIDのユーザーを取得
func (r *InMemoryUserRepository) FindByID(ctx context.Context, userID string) (*model.User, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	user, exists := r.users[userID]
	if !exists {
		return nil, ErrUserNotFound
	}
	return user, nil
}

// Save はユーザー情報を保存または更新
func (r *InMemoryUserRepository) Save(ctx context.Context, user *model.User) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	r.users[user.UserID] = user
	return nil
}

// ErrUserNotFound はユーザーが見つからないエラー
var ErrUserNotFound = &UserNotFoundError{}

type UserNotFoundError struct{}

func (e *UserNotFoundError) Error() string {
	return "user not found"
}
