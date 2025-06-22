package aggregate

import (
	"fmt"
	"time"
	"event-management-system/backend/internal/domain/vo"
)

// Registration はあるユーザーが、あるイベントに参加することを示す関係性です
type Registration struct {
	registrationID string
	event          *Event
	user           *User
	status         vo.RegistrationStatus
	appliedFee     vo.Money
	registeredAt   time.Time
	updatedAt      time.Time
}

// NewRegistration は新しいRegistrationを作成します
func NewRegistration(event *Event, user *User, appliedFee vo.Money) (*Registration, error) {
	if event == nil {
		return nil, fmt.Errorf("event cannot be nil")
	}
	if user == nil {
		return nil, fmt.Errorf("user cannot be nil")
	}

	now := time.Now()
	registration := &Registration{
		registrationID: generateRegistrationID(),
		event:          event,
		user:           user,
		status:         vo.RegistrationStatusRegistered,
		appliedFee:     appliedFee,
		registeredAt:   now,
		updatedAt:      now,
	}

	return registration, nil
}

// RegistrationID は登録IDを返します
func (r *Registration) RegistrationID() string {
	return r.registrationID
}

// Event は参加するイベントを返します
func (r *Registration) Event() *Event {
	return r.event
}

// User は参加するユーザーを返します
func (r *Registration) User() *User {
	return r.user
}

// Status は登録状態を返します
func (r *Registration) Status() vo.RegistrationStatus {
	return r.status
}

// AppliedFee は適用された料金を返します
func (r *Registration) AppliedFee() vo.Money {
	return r.appliedFee
}

// RegisteredAt は登録日時を返します
func (r *Registration) RegisteredAt() time.Time {
	return r.registeredAt
}

// UpdatedAt は更新日時を返します
func (r *Registration) UpdatedAt() time.Time {
	return r.updatedAt
}

// Cancel は参加登録をキャンセルします
func (r *Registration) Cancel() error {
	if !r.status.CanTransitionTo(vo.RegistrationStatusCancelled) {
		return fmt.Errorf("cannot cancel registration from status %s", r.status)
	}

	r.status = vo.RegistrationStatusCancelled
	r.updatedAt = time.Now()

	return nil
}

// IsActive は登録が有効かどうかをチェックします
func (r *Registration) IsActive() bool {
	return r.status == vo.RegistrationStatusRegistered
}

// String はRegistrationの文字列表現を返します
func (r *Registration) String() string {
	return fmt.Sprintf("Registration{ID: %s, Event: %s, User: %s, Status: %s, Fee: %s}", 
		r.registrationID, r.event.Title(), r.user.Name(), r.status, r.appliedFee.FormatJPY())
}

// generateRegistrationID は登録IDを生成します
func generateRegistrationID() string {
	return fmt.Sprintf("reg_%d", time.Now().UnixNano())
} 