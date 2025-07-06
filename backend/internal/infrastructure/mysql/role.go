package mysql

import (
	"context"
	"database/sql"
	"encoding/json"
	"event-management-system/backend/internal/domain/model"
	"fmt"
)

// MySQLRoleRepository はRoleRepositoryのMySQL実装
type MySQLRoleRepository struct {
	db *sql.DB
}

// NewMySQLRoleRepository は新しいMySQL役割リポジトリを作成
func NewMySQLRoleRepository(db *sql.DB) *MySQLRoleRepository {
	return &MySQLRoleRepository{db: db}
}

// FindByName は指定された名前の役割を取得
func (r *MySQLRoleRepository) FindByName(ctx context.Context, name string) (*model.Role, error) {
	query := "SELECT name, description, created_at, created_by, allowed_assigners FROM roles WHERE name = ?"

	row := r.db.QueryRowContext(ctx, query, name)

	var role model.Role
	var allowedAssignersJSON sql.NullString

	err := row.Scan(&role.Name, &role.Description, &role.CreatedAt, &role.CreatedBy, &allowedAssignersJSON)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrRoleNotFound
		}
		return nil, err
	}

	// JSONからallowed_assignersを復元
	if allowedAssignersJSON.Valid && allowedAssignersJSON.String != "" {
		if err := json.Unmarshal([]byte(allowedAssignersJSON.String), &role.AllowedAssigners); err != nil {
			return nil, err
		}
	} else {
		role.AllowedAssigners = []string{}
	}

	return &role, nil
}

// FindAll は全ての役割を取得
func (r *MySQLRoleRepository) FindAll(ctx context.Context) ([]*model.Role, error) {
	query := "SELECT name, description, created_at, created_by, allowed_assigners FROM roles ORDER BY created_at"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []*model.Role
	for rows.Next() {
		var role model.Role
		var allowedAssignersJSON sql.NullString

		if err := rows.Scan(&role.Name, &role.Description, &role.CreatedAt, &role.CreatedBy, &allowedAssignersJSON); err != nil {
			return nil, err
		}

		// JSONからallowed_assignersを復元
		if allowedAssignersJSON.Valid && allowedAssignersJSON.String != "" {
			if err := json.Unmarshal([]byte(allowedAssignersJSON.String), &role.AllowedAssigners); err != nil {
				return nil, err
			}
		} else {
			role.AllowedAssigners = []string{}
		}

		roles = append(roles, &role)
	}

	return roles, nil
}

// Save は役割情報を保存または更新
func (r *MySQLRoleRepository) Save(ctx context.Context, role *model.Role) error {
	// トランザクションを開始
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// allowed_assignersをJSONに変換
	allowedAssignersJSON, err := json.Marshal(role.AllowedAssigners)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO roles (name, description, created_at, created_by, allowed_assigners)
		VALUES (?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
		description = VALUES(description),
		allowed_assigners = VALUES(allowed_assigners)
	`

	_, err = tx.ExecContext(ctx, query,
		role.Name,
		role.Description,
		role.CreatedAt,
		role.CreatedBy,
		allowedAssignersJSON,
	)
	if err != nil {
		return err
	}

	// トランザクションをコミット
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// Delete は役割を削除
func (r *MySQLRoleRepository) Delete(ctx context.Context, name string) error {
	// トランザクションを開始
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// 関連するuser_rolesテーブルのデータを削除
	_, err = tx.ExecContext(ctx, "DELETE FROM user_roles WHERE role = ?", name)
	if err != nil {
		return fmt.Errorf("failed to delete user roles: %w", err)
	}

	// 役割を削除
	query := "DELETE FROM roles WHERE name = ?"
	result, err := tx.ExecContext(ctx, query, name)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return ErrRoleNotFound
	}

	// トランザクションをコミット
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// Exists は指定された名前の役割が存在するかチェック
func (r *MySQLRoleRepository) Exists(ctx context.Context, name string) (bool, error) {
	query := "SELECT COUNT(*) FROM roles WHERE name = ?"

	var count int
	err := r.db.QueryRowContext(ctx, query, name).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// FindUsersByRole は指定された役割を持つユーザー一覧を取得
func (r *MySQLRoleRepository) FindUsersByRole(ctx context.Context, roleName string) ([]*model.User, error) {
	query := `
		SELECT u.user_id, u.generation
		FROM users u
		JOIN user_roles ur ON u.user_id = ur.user_id
		WHERE ur.role = ?
		ORDER BY u.user_id
	`

	rows, err := r.db.QueryContext(ctx, query, roleName)
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
		users = append(users, &user)
	}

	return users, nil
}

// ErrRoleNotFound は役割が見つからないエラー
var ErrRoleNotFound = &RoleNotFoundError{}

type RoleNotFoundError struct{}

func (e *RoleNotFoundError) Error() string {
	return "role not found"
}
