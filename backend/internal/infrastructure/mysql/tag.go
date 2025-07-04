package mysql

import (
	"context"
	"database/sql"
	"event-management-system/backend/internal/domain/model"
	"event-management-system/backend/internal/domain/repository_interface"
	"fmt"
)

// MySQLTagRepository はMySQLのタグリポジトリ実装
type MySQLTagRepository struct {
	db *sql.DB
}

// NewMySQLTagRepository は新しいMySQLタグリポジトリを作成
func NewMySQLTagRepository(db *sql.DB) repository_interface.TagRepository {
	return &MySQLTagRepository{db: db}
}

// FindAll は全てのタグを取得
func (r *MySQLTagRepository) FindAll(ctx context.Context) ([]*model.TagEntity, error) {
	query := "SELECT name, created_at, created_by FROM tags ORDER BY name"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []*model.TagEntity
	for rows.Next() {
		var tag model.TagEntity
		if err := rows.Scan(&tag.Name, &tag.CreatedAt, &tag.CreatedBy); err != nil {
			return nil, err
		}
		tags = append(tags, &tag)
	}

	return tags, nil
}

// FindByName は指定された名前のタグを取得
func (r *MySQLTagRepository) FindByName(ctx context.Context, name string) (*model.TagEntity, error) {
	query := "SELECT name, created_at, created_by FROM tags WHERE name = ?"

	var tag model.TagEntity
	err := r.db.QueryRowContext(ctx, query, name).Scan(&tag.Name, &tag.CreatedAt, &tag.CreatedBy)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, repository_interface.ErrTagNotFound
		}
		return nil, err
	}

	return &tag, nil
}

// Save はタグ情報を保存または更新
func (r *MySQLTagRepository) Save(ctx context.Context, tag *model.TagEntity) error {
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

	query := `
		INSERT INTO tags (name, created_at, created_by) 
		VALUES (?, ?, ?) 
		ON DUPLICATE KEY UPDATE 
		created_at = VALUES(created_at), 
		created_by = VALUES(created_by)
	`

	_, err = tx.ExecContext(ctx, query, tag.Name, tag.CreatedAt, tag.CreatedBy)
	if err != nil {
		return err
	}

	// トランザクションをコミット
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// Exists は指定された名前のタグが存在するかチェック
func (r *MySQLTagRepository) Exists(ctx context.Context, name string) (bool, error) {
	query := "SELECT COUNT(*) FROM tags WHERE name = ?"

	var count int
	err := r.db.QueryRowContext(ctx, query, name).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// ErrTagNotFound はタグが見つからないエラー
var ErrTagNotFound = repository_interface.ErrTagNotFound
