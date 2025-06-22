package aggregate

import (
	"fmt"
	"time"
	"event-management-system/backend/internal/domain/entity"
	"event-management-system/backend/internal/domain/vo"
)

// Event はシステムで管理される中心的な集約ルートです
type Event struct {
	eventID       string
	organizer     *User
	title         string
	description   string
	status        vo.EventStatus
	allowedRoles  []string
	tags          []string
	venue         string
	schedulePoll  *entity.SchedulePoll
	feeSettings   []*entity.FeeSetting
	registrations []*Registration
	createdAt     time.Time
	updatedAt     time.Time
}

// NewEvent は新しいEventを作成します
func NewEvent(organizer *User, title, description, venue string, allowedRoles, tags []string, feeSettings []*entity.FeeSetting, pollCandidates []time.Time) (*Event, error) {
	if organizer == nil {
		return nil, fmt.Errorf("organizer cannot be nil")
	}
	if title == "" {
		return nil, fmt.Errorf("title cannot be empty")
	}
	if len(allowedRoles) == 0 {
		return nil, fmt.Errorf("allowed roles cannot be empty")
	}

	// 日程調整を作成
	schedulePoll, err := entity.NewSchedulePoll("date", pollCandidates)
	if err != nil {
		return nil, fmt.Errorf("failed to create schedule poll: %w", err)
	}

	now := time.Now()
	event := &Event{
		eventID:       generateEventID(),
		organizer:     organizer,
		title:         title,
		description:   description,
		status:        vo.EventStatusDraft,
		allowedRoles:  allowedRoles,
		tags:          tags,
		venue:         venue,
		schedulePoll:  schedulePoll,
		feeSettings:   feeSettings,
		registrations: []*Registration{},
		createdAt:     now,
		updatedAt:     now,
	}

	return event, nil
}

// EventID はイベントIDを返します
func (e *Event) EventID() string {
	return e.eventID
}

// Organizer は主催者を返します
func (e *Event) Organizer() *User {
	return e.organizer
}

// Title はイベントタイトルを返します
func (e *Event) Title() string {
	return e.title
}

// Description はイベントの説明を返します
func (e *Event) Description() string {
	return e.description
}

// Status はイベントのステータスを返します
func (e *Event) Status() vo.EventStatus {
	return e.status
}

// AllowedRoles は参加を許可する役割を返します
func (e *Event) AllowedRoles() []string {
	return e.allowedRoles
}

// Tags はタグを返します
func (e *Event) Tags() []string {
	return e.tags
}

// Venue は会場情報を返します
func (e *Event) Venue() string {
	return e.venue
}

// SchedulePoll は日程調整情報を返します
func (e *Event) SchedulePoll() *entity.SchedulePoll {
	return e.schedulePoll
}

// FeeSettings は料金設定を返します
func (e *Event) FeeSettings() []*entity.FeeSetting {
	return e.feeSettings
}

// Registrations は参加登録を返します
func (e *Event) Registrations() []*Registration {
	return e.registrations
}

// CreatedAt は作成日時を返します
func (e *Event) CreatedAt() time.Time {
	return e.createdAt
}

// UpdatedAt は更新日時を返します
func (e *Event) UpdatedAt() time.Time {
	return e.updatedAt
}

// UpdateDetails はイベント情報を編集します
func (e *Event) UpdateDetails(title, description, venue string, allowedRoles, tags []string, feeSettings []*entity.FeeSetting) error {
	if e.status != vo.EventStatusDraft {
		return fmt.Errorf("cannot update event that is not in draft status")
	}

	if title == "" {
		return fmt.Errorf("title cannot be empty")
	}
	if len(allowedRoles) == 0 {
		return fmt.Errorf("allowed roles cannot be empty")
	}

	e.title = title
	e.description = description
	e.venue = venue
	e.allowedRoles = allowedRoles
	e.tags = tags
	e.feeSettings = feeSettings
	e.updatedAt = time.Now()

	return nil
}

// StartSchedulePolling は日程調整を開始します
func (e *Event) StartSchedulePolling() error {
	if !e.status.CanTransitionTo(vo.EventStatusSchedulePolling) {
		return fmt.Errorf("cannot start schedule polling from status %s", e.status)
	}

	e.status = vo.EventStatusSchedulePolling
	e.updatedAt = time.Now()

	return nil
}

// ConfirmSchedule は開催日時を確定します
func (e *Event) ConfirmSchedule(finalizedDate time.Time) error {
	if e.status != vo.EventStatusSchedulePolling {
		return fmt.Errorf("cannot confirm schedule from status %s", e.status)
	}

	if finalizedDate.Before(time.Now()) {
		return fmt.Errorf("finalized date cannot be in the past")
	}

	if err := e.schedulePoll.FinalizeSchedule(finalizedDate); err != nil {
		return fmt.Errorf("failed to finalize schedule: %w", err)
	}

	e.status = vo.EventStatusConfirmed
	e.updatedAt = time.Now()

	return nil
}

// Publish は参加者募集を開始します
func (e *Event) Publish() error {
	if !e.status.CanTransitionTo(vo.EventStatusConfirmed) {
		return fmt.Errorf("cannot publish event from status %s", e.status)
	}

	// 不変条件: 公開時、日程調整が完了し、開催日時が確定していなければならない
	if !e.schedulePoll.IsFinalized() {
		return fmt.Errorf("cannot publish event without finalized schedule")
	}

	finalizedDate := e.schedulePoll.FinalizedDate()
	if finalizedDate == nil {
		return fmt.Errorf("finalized date is not set")
	}

	// 不変条件: 公開時、イベントの開始日は過去であってはならない
	if finalizedDate.Before(time.Now()) {
		return fmt.Errorf("cannot publish event with past start date")
	}

	e.status = vo.EventStatusConfirmed
	e.updatedAt = time.Now()

	return nil
}

// Cancel はイベントをキャンセルします
func (e *Event) Cancel() error {
	if !e.status.CanTransitionTo(vo.EventStatusCancelled) {
		return fmt.Errorf("cannot cancel event from status %s", e.status)
	}

	e.status = vo.EventStatusCancelled
	e.updatedAt = time.Now()

	return nil
}

// Finish はイベントを終了済みにします
func (e *Event) Finish() error {
	if !e.status.CanTransitionTo(vo.EventStatusFinished) {
		return fmt.Errorf("cannot finish event from status %s", e.status)
	}

	e.status = vo.EventStatusFinished
	e.updatedAt = time.Now()

	return nil
}

// AddRegistration は参加登録を追加します
func (e *Event) AddRegistration(user *User) (*Registration, error) {
	// 不変条件: イベントへの参加登録は、Event の AllowedRoles に含まれる役割を持つ User のみ行える
	if !user.HasAnyRole(e.allowedRoles) {
		return nil, fmt.Errorf("user %s does not have required role for this event", user.UserID())
	}

	// 既存の登録をチェック
	for _, registration := range e.registrations {
		if registration.User().UserID() == user.UserID() {
			return nil, fmt.Errorf("user %s is already registered", user.UserID())
		}
	}

	// 適用される料金を決定
	appliedFee, err := e.GetApplicableFee(user)
	if err != nil {
		return nil, fmt.Errorf("failed to determine applicable fee: %w", err)
	}

	registration, err := NewRegistration(e, user, appliedFee)
	if err != nil {
		return nil, fmt.Errorf("failed to create registration: %w", err)
	}

	e.registrations = append(e.registrations, registration)
	e.updatedAt = time.Now()

	return registration, nil
}

// GetApplicableFee は特定のユーザーに適用される料金を決定して返します
func (e *Event) GetApplicableFee(user *User) (vo.Money, error) {
	// 最も具体的な料金設定を優先（世代指定あり > 世代指定なし）
	var mostSpecificFeeSetting *entity.FeeSetting

	for _, feeSetting := range e.feeSettings {
		if feeSetting.IsApplicableTo(user.Role(), user.Generation()) {
			// 世代指定がある場合は優先
			if feeSetting.ApplicableGeneration() != nil {
				if mostSpecificFeeSetting == nil || mostSpecificFeeSetting.ApplicableGeneration() == nil {
					mostSpecificFeeSetting = feeSetting
				}
			} else {
				// 世代指定がない場合は、より具体的な設定がない場合のみ使用
				if mostSpecificFeeSetting == nil {
					mostSpecificFeeSetting = feeSetting
				}
			}
		}
	}

	if mostSpecificFeeSetting == nil {
		// デフォルト料金（0円）
		return vo.NewJPY(0)
	}

	return mostSpecificFeeSetting.Fee(), nil
}

// GetRegistrationByUserID は指定されたユーザーIDの登録を取得します
func (e *Event) GetRegistrationByUserID(userID string) *Registration {
	for _, registration := range e.registrations {
		if registration.User().UserID() == userID {
			return registration
		}
	}
	return nil
}

// generateEventID はイベントIDを生成します
func generateEventID() string {
	return fmt.Sprintf("event_%d", time.Now().UnixNano())
} 