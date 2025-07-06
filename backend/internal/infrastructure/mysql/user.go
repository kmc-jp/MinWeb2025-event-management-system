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
	query := "SELECT user_id, generation FROM users WHERE user_id = ?"

	row := r.db.QueryRowContext(ctx, query, userID)

	var user model.User

	err := row.Scan(&user.UserID, &user.Generation)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	// ユーザーの役割を取得
	rolesQuery := "SELECT role FROM user_roles WHERE user_id = ?"
	rows, err := r.db.QueryContext(ctx, rolesQuery, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []model.UserRole
	for rows.Next() {
		var roleStr string
		if err := rows.Scan(&roleStr); err != nil {
			return nil, err
		}
		roles = append(roles, model.UserRole(roleStr))
	}

	user.Roles = roles
	return &user, nil
}

// FindAll は全てのユーザーを取得
func (r *MySQLUserRepository) FindAll(ctx context.Context) ([]*model.User, error) {
	query := "SELECT user_id, generation FROM users ORDER BY user_id"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*model.User
	for rows.Next() {
		var user model.User
		if err := rows.Scan(&user.UserID, &user.Generation); err != nil {
			return nil, err
		}

		// ユーザーの役割を取得
		rolesQuery := "SELECT role FROM user_roles WHERE user_id = ?"
		roleRows, err := r.db.QueryContext(ctx, rolesQuery, user.UserID)
		if err != nil {
			return nil, err
		}

		var roles []model.UserRole
		for roleRows.Next() {
			var roleStr string
			if err := roleRows.Scan(&roleStr); err != nil {
				roleRows.Close()
				return nil, err
			}
			roles = append(roles, model.UserRole(roleStr))
		}
		roleRows.Close()

		user.Roles = roles
		users = append(users, &user)
	}

	return users, nil
}

// Save はユーザー情報を保存または更新
func (r *MySQLUserRepository) Save(ctx context.Context, user *model.User) error {
	// トランザクション開始
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// ユーザー基本情報を保存
	query := `
		INSERT INTO users (user_id, generation)
		VALUES (?, ?)
		ON DUPLICATE KEY UPDATE
		generation = VALUES(generation)
	`

	_, err = tx.ExecContext(ctx, query,
		user.UserID,
		user.Generation,
	)
	if err != nil {
		return err
	}

	// 既存の役割を削除
	_, err = tx.ExecContext(ctx, "DELETE FROM user_roles WHERE user_id = ?", user.UserID)
	if err != nil {
		return err
	}

	// 新しい役割を挿入
	for _, role := range user.Roles {
		_, err := tx.ExecContext(ctx, "INSERT INTO user_roles (user_id, role) VALUES (?, ?)", user.UserID, string(role))
		if err != nil {
			return err
		}
	}

	// トランザクションコミット
	return tx.Commit()
}

// ErrUserNotFound はユーザーが見つからないエラー
var ErrUserNotFound = &UserNotFoundError{}

type UserNotFoundError struct{}

func (e *UserNotFoundError) Error() string {
	return "user not found"
}
