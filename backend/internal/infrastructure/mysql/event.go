package mysql

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"event-management-system/backend/internal/domain/model"
	"event-management-system/backend/internal/domain/repository_interface"

	_ "github.com/go-sql-driver/mysql"
)

// MySQLEventRepository はMySQLを使用したイベントリポジトリの実装です
type MySQLEventRepository struct {
	db *sql.DB
}

// NewMySQLEventRepository は新しいMySQLイベントリポジトリを作成します
func NewMySQLEventRepository(dsn string) (repository_interface.EventRepository, error) {
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

// NewMySQLEventRepositoryWithDB は既存のデータベース接続を使用してMySQLイベントリポジトリを作成します
func NewMySQLEventRepositoryWithDB(db *sql.DB) repository_interface.EventRepository {
	return &MySQLEventRepository{db: db}
}

// Save はイベントを保存または更新します
func (r *MySQLEventRepository) Save(ctx context.Context, event *model.Event) error {
	// イベント基本情報を保存
	query := `
		INSERT INTO events (event_id, title, description, status, venue, organizer_id, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
		title = VALUES(title),
		description = VALUES(description),
		status = VALUES(status),
		venue = VALUES(venue),
		updated_at = VALUES(updated_at)
	`

	_, err := r.db.ExecContext(ctx, query,
		event.EventID,
		event.Title,
		event.Description,
		string(event.Status),
		event.Venue,
		event.Organizer.UserID,
		event.CreatedAt,
		event.UpdatedAt,
	)
	if err != nil {
		return err
	}

	// 許可された役割を保存
	if err := r.saveAllowedRoles(ctx, event.EventID, event.AllowedRoles); err != nil {
		return err
	}

	// タグを保存
	if err := r.saveTags(ctx, event.EventID, event.Tags); err != nil {
		return err
	}

	// 料金設定を保存
	if err := r.saveFeeSettings(ctx, event.EventID, event.FeeSettings); err != nil {
		return err
	}

	// 日程調整情報を保存
	if event.SchedulePoll != nil {
		if err := r.saveSchedulePoll(ctx, event.EventID, event.SchedulePoll); err != nil {
			return err
		}
	}

	return nil
}

// FindByID は指定されたIDのイベントを取得します
func (r *MySQLEventRepository) FindByID(ctx context.Context, id string) (*model.Event, error) {
	query := `
		SELECT e.event_id, e.title, e.description, e.status, e.venue, e.created_at, e.updated_at,
		       u.user_id, u.name, u.role, u.generation
		FROM events e
		JOIN users u ON e.organizer_id = u.user_id
		WHERE e.event_id = ?
	`

	row := r.db.QueryRowContext(ctx, query, id)

	var event model.Event
	var organizer model.User
	var statusStr string

	err := row.Scan(
		&event.EventID,
		&event.Title,
		&event.Description,
		&statusStr,
		&event.Venue,
		&event.CreatedAt,
		&event.UpdatedAt,
		&organizer.UserID,
		&organizer.Name,
		&organizer.Role,
		&organizer.Generation,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrEventNotFound
		}
		return nil, err
	}

	event.Status = model.EventStatus(statusStr)
	event.Organizer = &organizer

	// 関連データを取得
	if err := r.loadEventRelations(ctx, &event); err != nil {
		return nil, err
	}

	return &event, nil
}

// FindAll は全てのイベントを取得します
func (r *MySQLEventRepository) FindAll(ctx context.Context) ([]*model.Event, error) {
	query := `
		SELECT e.event_id, e.title, e.description, e.status, e.venue, e.created_at, e.updated_at,
		       u.user_id, u.name, u.role, u.generation
		FROM events e
		JOIN users u ON e.organizer_id = u.user_id
		ORDER BY e.created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*model.Event
	for rows.Next() {
		var event model.Event
		var organizer model.User
		var statusStr string

		err := rows.Scan(
			&event.EventID,
			&event.Title,
			&event.Description,
			&statusStr,
			&event.Venue,
			&event.CreatedAt,
			&event.UpdatedAt,
			&organizer.UserID,
			&organizer.Name,
			&organizer.Role,
			&organizer.Generation,
		)
		if err != nil {
			return nil, err
		}

		event.Status = model.EventStatus(statusStr)
		event.Organizer = &organizer

		// 関連データを取得
		if err := r.loadEventRelations(ctx, &event); err != nil {
			return nil, err
		}

		events = append(events, &event)
	}

	return events, nil
}

// FindByStatus は指定されたステータスのイベントを取得します
func (r *MySQLEventRepository) FindByStatus(ctx context.Context, status model.EventStatus) ([]*model.Event, error) {
	query := `
		SELECT e.event_id, e.title, e.description, e.status, e.venue, e.created_at, e.updated_at,
		       u.user_id, u.name, u.role, u.generation
		FROM events e
		JOIN users u ON e.organizer_id = u.user_id
		WHERE e.status = ?
		ORDER BY e.created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, string(status))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*model.Event
	for rows.Next() {
		var event model.Event
		var organizer model.User
		var statusStr string

		err := rows.Scan(
			&event.EventID,
			&event.Title,
			&event.Description,
			&statusStr,
			&event.Venue,
			&event.CreatedAt,
			&event.UpdatedAt,
			&organizer.UserID,
			&organizer.Name,
			&organizer.Role,
			&organizer.Generation,
		)
		if err != nil {
			return nil, err
		}

		event.Status = model.EventStatus(statusStr)
		event.Organizer = &organizer

		// 関連データを取得
		if err := r.loadEventRelations(ctx, &event); err != nil {
			return nil, err
		}

		events = append(events, &event)
	}

	return events, nil
}

// Delete は指定されたIDのイベントを削除します
func (r *MySQLEventRepository) Delete(ctx context.Context, id string) error {
	query := "DELETE FROM events WHERE event_id = ?"
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// Close はデータベース接続を閉じます
func (r *MySQLEventRepository) Close() error {
	return r.db.Close()
}

// ヘルパーメソッド群
func (r *MySQLEventRepository) saveAllowedRoles(ctx context.Context, eventID string, roles []model.UserRole) error {
	// 既存の役割を削除
	_, err := r.db.ExecContext(ctx, "DELETE FROM event_allowed_roles WHERE event_id = ?", eventID)
	if err != nil {
		return err
	}

	// 新しい役割を挿入
	for _, role := range roles {
		_, err := r.db.ExecContext(ctx, "INSERT INTO event_allowed_roles (event_id, role) VALUES (?, ?)", eventID, string(role))
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *MySQLEventRepository) saveTags(ctx context.Context, eventID string, tags []model.Tag) error {
	// 既存のタグを削除
	_, err := r.db.ExecContext(ctx, "DELETE FROM event_tags WHERE event_id = ?", eventID)
	if err != nil {
		return err
	}

	// 新しいタグを挿入
	for _, tag := range tags {
		_, err := r.db.ExecContext(ctx, "INSERT INTO event_tags (event_id, tag) VALUES (?, ?)", eventID, string(tag))
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *MySQLEventRepository) saveFeeSettings(ctx context.Context, eventID string, feeSettings []model.FeeSetting) error {
	// 既存の料金設定を削除
	_, err := r.db.ExecContext(ctx, "DELETE FROM event_fee_settings WHERE event_id = ?", eventID)
	if err != nil {
		return err
	}

	// 新しい料金設定を挿入
	for _, fs := range feeSettings {
		_, err := r.db.ExecContext(ctx,
			"INSERT INTO event_fee_settings (event_id, applicable_role, applicable_generation, fee_amount, fee_currency) VALUES (?, ?, ?, ?, ?)",
			eventID, string(fs.ApplicableRole), fs.ApplicableGeneration, fs.Fee.Amount, fs.Fee.Currency)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *MySQLEventRepository) saveSchedulePoll(ctx context.Context, eventID string, poll *model.SchedulePoll) error {
	// 日程調整情報をJSONとして保存
	pollData, err := json.Marshal(poll)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO event_schedule_polls (event_id, poll_data)
		VALUES (?, ?)
		ON DUPLICATE KEY UPDATE poll_data = VALUES(poll_data)
	`
	_, err = r.db.ExecContext(ctx, query, eventID, pollData)
	return err
}

func (r *MySQLEventRepository) loadEventRelations(ctx context.Context, event *model.Event) error {
	// 許可された役割を取得
	rows, err := r.db.QueryContext(ctx, "SELECT role FROM event_allowed_roles WHERE event_id = ?", event.EventID)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var roleStr string
		if err := rows.Scan(&roleStr); err != nil {
			return err
		}
		event.AllowedRoles = append(event.AllowedRoles, model.UserRole(roleStr))
	}

	// タグを取得
	rows, err = r.db.QueryContext(ctx, "SELECT tag FROM event_tags WHERE event_id = ?", event.EventID)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var tagStr string
		if err := rows.Scan(&tagStr); err != nil {
			return err
		}
		event.Tags = append(event.Tags, model.Tag(tagStr))
	}

	// 料金設定を取得
	rows, err = r.db.QueryContext(ctx,
		"SELECT applicable_role, applicable_generation, fee_amount, fee_currency FROM event_fee_settings WHERE event_id = ?",
		event.EventID)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var fs model.FeeSetting
		var roleStr string
		if err := rows.Scan(&roleStr, &fs.ApplicableGeneration, &fs.Fee.Amount, &fs.Fee.Currency); err != nil {
			return err
		}
		fs.ApplicableRole = model.UserRole(roleStr)
		event.FeeSettings = append(event.FeeSettings, fs)
	}

	// 日程調整情報を取得
	var pollData []byte
	err = r.db.QueryRowContext(ctx, "SELECT poll_data FROM event_schedule_polls WHERE event_id = ?", event.EventID).Scan(&pollData)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	if err == nil {
		var poll model.SchedulePoll
		if err := json.Unmarshal(pollData, &poll); err != nil {
			return err
		}
		event.SchedulePoll = &poll
	}

	return nil
}

// ErrEventNotFound はイベントが見つからないエラー
var ErrEventNotFound = &EventNotFoundError{}

type EventNotFoundError struct{}

func (e *EventNotFoundError) Error() string {
	return "event not found"
}
