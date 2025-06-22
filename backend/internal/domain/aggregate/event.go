package aggregate

import (
	"time"

	"event-management-system/backend/internal/domain"

	"github.com/google/uuid"
)

// Event はイベント集約を表します
// DDDの集約パターンに従い、ビジネスルールと不変条件をカプセル化します
type Event struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	StartDate   time.Time   `json:"start_date"`
	EndDate     time.Time   `json:"end_date"`
	Status      EventStatus `json:"status"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

// EventStatus はイベントのステータスを表す値オブジェクトです
type EventStatus string

const (
	EventStatusDraft     EventStatus = "draft"
	EventStatusPublished EventStatus = "published"
	EventStatusCancelled EventStatus = "cancelled"
	EventStatusCompleted EventStatus = "completed"
)

// MarshalJSON はEventStatusをJSONに変換します
func (s EventStatus) MarshalJSON() ([]byte, error) {
	return []byte(`"` + s + `"`), nil
}

// UnmarshalJSON はJSONからEventStatusに変換します
func (s *EventStatus) UnmarshalJSON(data []byte) error {
	// ダブルクォートを除去
	status := string(data)
	if len(status) >= 2 && status[0] == '"' && status[len(status)-1] == '"' {
		status = status[1 : len(status)-1]
	}
	*s = EventStatus(status)
	return nil
}

// NewEvent は新しいイベントを作成します
// ファクトリーパターンを使用して、適切な初期状態のイベントを生成します
func NewEvent(name, description string, startDate, endDate time.Time) (*Event, error) {
	if name == "" {
		return nil, domain.ErrEventNameRequired
	}

	if startDate.After(endDate) {
		return nil, domain.ErrInvalidEventDates
	}

	now := time.Now()
	return &Event{
		ID:          uuid.New().String(),
		Name:        name,
		Description: description,
		StartDate:   startDate,
		EndDate:     endDate,
		Status:      EventStatusDraft,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

// Publish はイベントを公開状態にします
// ビジネスルール: 公開可能な条件をチェックします
func (e *Event) Publish() error {
	if e.Status != EventStatusDraft {
		return domain.ErrEventCannotBePublished
	}

	if time.Now().After(e.StartDate) {
		return domain.ErrEventCannotBePublishedAfterStart
	}

	e.Status = EventStatusPublished
	e.UpdatedAt = time.Now()
	return nil
}

// Cancel はイベントをキャンセル状態にします
func (e *Event) Cancel() error {
	if e.Status == EventStatusCompleted {
		return domain.ErrEventCannotBeCancelled
	}

	e.Status = EventStatusCancelled
	e.UpdatedAt = time.Now()
	return nil
}

// UpdateDetails はイベントの詳細を更新します
func (e *Event) UpdateDetails(name, description string, startDate, endDate time.Time) error {
	if name == "" {
		return domain.ErrEventNameRequired
	}

	if startDate.After(endDate) {
		return domain.ErrInvalidEventDates
	}

	e.Name = name
	e.Description = description
	e.StartDate = startDate
	e.EndDate = endDate
	e.UpdatedAt = time.Now()
	return nil
}
