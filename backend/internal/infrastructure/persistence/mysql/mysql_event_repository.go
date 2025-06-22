package mysql

import (
	"context"
	"database/sql"
	"fmt"

	"event-management-system/backend/internal/domain/aggregate"
	"event-management-system/backend/internal/domain/repository"

	_ "github.com/go-sql-driver/mysql"
)

// MySQLEventRepository はMySQLを使用したイベントリポジトリの実装です
type MySQLEventRepository struct {
	db *sql.DB
}

// NewMySQLEventRepository は新しいMySQLイベントリポジトリを作成します
func NewMySQLEventRepository(dsn string) (repository.EventRepository, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// データベース接続をテスト
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &MySQLEventRepository{db: db}, nil
}

// Save はイベントを保存または更新します
func (r *MySQLEventRepository) Save(ctx context.Context, event *aggregate.Event) error {
	query := `
		INSERT INTO events (id, name, description, start_date, end_date, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			name = VALUES(name),
			description = VALUES(description),
			start_date = VALUES(start_date),
			end_date = VALUES(end_date),
			status = VALUES(status),
			updated_at = VALUES(updated_at)
	`

	_, err := r.db.ExecContext(ctx, query,
		event.ID,
		event.Name,
		event.Description,
		event.StartDate,
		event.EndDate,
		string(event.Status),
		event.CreatedAt,
		event.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to save event: %w", err)
	}

	return nil
}

// FindByID は指定されたIDのイベントを取得します
func (r *MySQLEventRepository) FindByID(ctx context.Context, id string) (*aggregate.Event, error) {
	query := `
		SELECT id, name, description, start_date, end_date, status, created_at, updated_at
		FROM events
		WHERE id = ?
	`

	var event aggregate.Event
	var statusStr string

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&event.ID,
		&event.Name,
		&event.Description,
		&event.StartDate,
		&event.EndDate,
		&statusStr,
		&event.CreatedAt,
		&event.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // イベントが見つからない場合はnilを返す
		}
		return nil, fmt.Errorf("failed to find event by ID: %w", err)
	}

	event.Status = aggregate.EventStatus(statusStr)
	return &event, nil
}

// FindAll は全てのイベントを取得します
func (r *MySQLEventRepository) FindAll(ctx context.Context) ([]*aggregate.Event, error) {
	query := `
		SELECT id, name, description, start_date, end_date, status, created_at, updated_at
		FROM events
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query events: %w", err)
	}
	defer rows.Close()

	var events []*aggregate.Event
	for rows.Next() {
		var event aggregate.Event
		var statusStr string

		err := rows.Scan(
			&event.ID,
			&event.Name,
			&event.Description,
			&event.StartDate,
			&event.EndDate,
			&statusStr,
			&event.CreatedAt,
			&event.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event: %w", err)
		}

		event.Status = aggregate.EventStatus(statusStr)
		events = append(events, &event)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over events: %w", err)
	}

	return events, nil
}

// FindByStatus は指定されたステータスのイベントを取得します
func (r *MySQLEventRepository) FindByStatus(ctx context.Context, status aggregate.EventStatus) ([]*aggregate.Event, error) {
	query := `
		SELECT id, name, description, start_date, end_date, status, created_at, updated_at
		FROM events
		WHERE status = ?
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, string(status))
	if err != nil {
		return nil, fmt.Errorf("failed to query events by status: %w", err)
	}
	defer rows.Close()

	var events []*aggregate.Event
	for rows.Next() {
		var event aggregate.Event
		var statusStr string

		err := rows.Scan(
			&event.ID,
			&event.Name,
			&event.Description,
			&event.StartDate,
			&event.EndDate,
			&statusStr,
			&event.CreatedAt,
			&event.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event: %w", err)
		}

		event.Status = aggregate.EventStatus(statusStr)
		events = append(events, &event)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over events: %w", err)
	}

	return events, nil
}

// Delete は指定されたIDのイベントを削除します
func (r *MySQLEventRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM events WHERE id = ?`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete event: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("event with ID %s not found", id)
	}

	return nil
}

// Close はデータベース接続を閉じます
func (r *MySQLEventRepository) Close() error {
	return r.db.Close()
}
