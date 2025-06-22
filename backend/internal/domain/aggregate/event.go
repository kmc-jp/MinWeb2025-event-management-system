package aggregate

import (
	"time"

	"github.com/google/uuid"
	"event-management-system/backend/internal/domain"
)

// Event はイベント集約を表します
// DDDの集約パターンに従い、ビジネスルールと不変条件をカプセル化します
type Event struct {
	ID          string
	Name        string
	Description string
	StartDate   time.Time
	EndDate     time.Time
	Status      EventStatus
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// EventStatus はイベントのステータスを表す値オブジェクトです
type EventStatus string

const (
	EventStatusDraft     EventStatus = "draft"
	EventStatusPublished EventStatus = "published"
	EventStatusCancelled EventStatus = "cancelled"
	EventStatusCompleted EventStatus = "completed"
)

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