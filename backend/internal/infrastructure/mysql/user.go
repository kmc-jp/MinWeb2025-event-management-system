package mysql

import (
	"context"
	"database/sql"
	"event-management-system/backend/internal/domain/model"
)

// MySQLUserRepository はUserRepositoryのMySQL実装
type MySQLUserRepository struct {
	db *sql.DB
}

// NewMySQLUserRepository は新しいMySQLユーザーリポジトリを作成
func NewMySQLUserRepository(db *sql.DB) *MySQLUserRepository {
	return &MySQLUserRepository{db: db}
}

// FindByID は指定されたIDのユーザーを取得
func (r *MySQLUserRepository) FindByID(ctx context.Context, userID string) (*model.User, error) {
	query := "SELECT user_id, name, role, generation FROM users WHERE user_id = ?"

	row := r.db.QueryRowContext(ctx, query, userID)

	var user model.User
	var roleStr string

	err := row.Scan(&user.UserID, &user.Name, &roleStr, &user.Generation)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	user.Role = model.UserRole(roleStr)
	return &user, nil
}

// Save はユーザー情報を保存または更新
func (r *MySQLUserRepository) Save(ctx context.Context, user *model.User) error {
	query := `
		INSERT INTO users (user_id, name, role, generation)
		VALUES (?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
		name = VALUES(name),
		role = VALUES(role),
		generation = VALUES(generation)
	`

	_, err := r.db.ExecContext(ctx, query,
		user.UserID,
		user.Name,
		string(user.Role),
		user.Generation,
	)
	return err
}

// ErrUserNotFound はユーザーが見つからないエラー
var ErrUserNotFound = &UserNotFoundError{}

type UserNotFoundError struct{}

func (e *UserNotFoundError) Error() string {
	return "user not found"
}
