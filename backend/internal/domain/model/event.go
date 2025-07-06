package model

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// EventStatus: イベントのライフサイクル状態
// DRAFT, SCHEDULE_POLLING, CONFIRMED, FINISHED, CANCELLED

type EventStatus string

const (
	EventStatusSchedulePoll EventStatus = "SCHEDULE_POLLING"
	EventStatusConfirmed    EventStatus = "CONFIRMED"
	EventStatusFinished     EventStatus = "FINISHED"
	EventStatusCancelled    EventStatus = "CANCELLED"
)

// Money: 金額と通貨を扱う値オブジェクト

type Money struct {
	Amount   int64  // 金額（最小単位）
	Currency string // 通貨（例: "JPY"）
}

// FeeSetting: 世代ごとの料金ルール
type FeeSetting struct {
	ApplicableGeneration int64
	Fee                  Money
}

// SchedulePoll: 日程調整エンティティ
type SchedulePoll struct {
	PollType       string // 例: "date_select"
	CandidateDates []time.Time
	Responses      map[string][]time.Time // UserID -> 候補日リスト
	FinalizedDate  *time.Time
}

// Comment: コメント
type Comment struct {
	UserID    string
	Content   string
	CreatedAt time.Time
}

// EventReport: イベント記録

type EventReport struct {
	ReportID  string
	Content   string
	CreatedAt time.Time
}

// Tag: タグ

type Tag string

// EventParticipantStatus: イベント参加者のステータス
type EventParticipantStatus string

const (
	EventParticipantStatusPending   EventParticipantStatus = "PENDING"
	EventParticipantStatusConfirmed EventParticipantStatus = "CONFIRMED"
	EventParticipantStatusCancelled EventParticipantStatus = "CANCELLED"
)

// EventParticipant: イベント参加者
type EventParticipant struct {
	UserID     string
	Generation int
	JoinedAt   time.Time
	Status     EventParticipantStatus
}

// TagEntity はタグ管理用のエンティティです
type TagEntity struct {
	Name      string
	CreatedAt time.Time
	CreatedBy string
}

// NewTagEntity は新しいタグエンティティを作成します
func NewTagEntity(name, createdBy string) *TagEntity {
	return &TagEntity{
		Name:      name,
		CreatedAt: time.Now(),
		CreatedBy: createdBy,
	}
}

// Event: イベント集約

type Event struct {
	EventID                   string
	Organizer                 *User
	Title                     string
	Description               string
	Status                    EventStatus
	AllowedParticipationRoles []UserRole
	AllowedEditRoles          []UserRole
	Tags                      []Tag
	Venue                     string
	SchedulePoll              *SchedulePoll
	FeeSettings               []FeeSetting
	Comments                  []Comment
	EventReports              []EventReport
	Participants              []EventParticipant // イベント参加者
	ConfirmedDate             *time.Time         // 確定した日程
	ScheduleDeadline          *time.Time         // 日程確定予定日
	CreatedAt                 time.Time
	UpdatedAt                 time.Time
}

// --- ファクトリ・振る舞い ---

func NewEvent(organizer *User, title, description, venue string, allowedParticipationRoles, allowedEditRoles []UserRole, tags []Tag, feeSettings []FeeSetting, pollType string, pollCandidates []time.Time, confirmedDate *time.Time, scheduleDeadline *time.Time) *Event {
	now := time.Now()

	// 日程設定に基づいてステータスを決定
	var status EventStatus
	if confirmedDate != nil {
		status = EventStatusConfirmed
	} else if pollType != "" && len(pollCandidates) > 0 {
		status = EventStatusSchedulePoll
	} else {
		// デフォルトは日程調整中
		status = EventStatusSchedulePoll
	}

	// 作成者を参加者として追加
	organizerParticipant := EventParticipant{
		UserID:     organizer.UserID,
		Generation: organizer.Generation,
		JoinedAt:   now,
		Status:     EventParticipantStatusConfirmed, // 作成者は確定済み
	}

	return &Event{
		EventID:                   uuid.New().String(),
		Organizer:                 organizer,
		Title:                     title,
		Description:               description,
		Status:                    status,
		AllowedParticipationRoles: allowedParticipationRoles,
		AllowedEditRoles:          allowedEditRoles,
		Tags:                      tags,
		Venue:                     venue,
		SchedulePoll: &SchedulePoll{
			PollType:       pollType,
			CandidateDates: pollCandidates,
			Responses:      make(map[string][]time.Time),
		},
		FeeSettings:      feeSettings,
		Comments:         []Comment{},
		EventReports:     []EventReport{},
		Participants:     []EventParticipant{organizerParticipant}, // 作成者を初期参加者として追加
		ConfirmedDate:    confirmedDate,
		ScheduleDeadline: scheduleDeadline,
		CreatedAt:        now,
		UpdatedAt:        now,
	}
}

func (e *Event) UpdateDetails(title, description, venue string, allowedParticipationRoles, allowedEditRoles []UserRole, tags []Tag, feeSettings []FeeSetting) {
	e.Title = title
	e.Description = description
	e.Venue = venue
	e.AllowedParticipationRoles = allowedParticipationRoles
	e.AllowedEditRoles = allowedEditRoles
	e.Tags = tags
	e.FeeSettings = feeSettings
	e.UpdatedAt = time.Now()
}

func (e *Event) UpdateScheduleSettings(pollType string, pollCandidates []time.Time, confirmedDate *time.Time, scheduleDeadline *time.Time) {
	if e.SchedulePoll == nil {
		e.SchedulePoll = &SchedulePoll{
			PollType:       pollType,
			CandidateDates: pollCandidates,
			Responses:      make(map[string][]time.Time),
		}
	} else {
		e.SchedulePoll.PollType = pollType
		e.SchedulePoll.CandidateDates = pollCandidates
	}
	e.ConfirmedDate = confirmedDate
	e.ScheduleDeadline = scheduleDeadline

	// 日程設定に基づいてステータスを更新
	if confirmedDate != nil {
		e.Status = EventStatusConfirmed
	} else if pollType != "" && len(pollCandidates) > 0 {
		e.Status = EventStatusSchedulePoll
	} else {
		// デフォルトは日程調整中
		e.Status = EventStatusSchedulePoll
	}

	e.UpdatedAt = time.Now()
}

func (e *Event) StartSchedulePolling() {
	e.Status = EventStatusSchedulePoll
	e.UpdatedAt = time.Now()
}

func (e *Event) ConfirmSchedule(finalDate time.Time) error {
	if e.SchedulePoll != nil {
		e.SchedulePoll.FinalizedDate = &finalDate
	}
	e.ConfirmedDate = &finalDate
	e.Status = EventStatusConfirmed
	e.UpdatedAt = time.Now()
	return nil
}

func (e *Event) Publish() {
	// 不変条件: 日程調整が完了し、開催日時が確定している必要
	if e.SchedulePoll == nil || e.SchedulePoll.FinalizedDate == nil {
		panic("Cannot publish: schedule not finalized")
	}
	if e.SchedulePoll.FinalizedDate.Before(time.Now()) {
		panic("Cannot publish: event date is in the past")
	}
	if e.Status == EventStatusCancelled {
		panic("Cannot publish: event is cancelled")
	}
	e.Status = EventStatusConfirmed
	e.UpdatedAt = time.Now()
}

func (e *Event) Cancel() {
	if e.Status == EventStatusFinished {
		panic("Cannot cancel: event is finished")
	}
	e.Status = EventStatusCancelled
	e.UpdatedAt = time.Now()
}

func (e *Event) Finish() {
	e.Status = EventStatusFinished
	e.UpdatedAt = time.Now()
}

func (e *Event) AddComment(userID, content string) {
	c := Comment{UserID: userID, Content: content, CreatedAt: time.Now()}
	e.Comments = append(e.Comments, c)
	e.UpdatedAt = time.Now()
}

func (e *Event) GetApplicableFee(user *User) *Money {
	for _, fs := range e.FeeSettings {
		if fs.ApplicableGeneration == int64(user.Generation) {
			return &fs.Fee
		}
	}
	return nil
}

// イベント参加機能のメソッド
func (e *Event) JoinEvent(user *User) error {
	// 既に参加しているかチェック
	for _, p := range e.Participants {
		if p.UserID == user.UserID {
			return fmt.Errorf("user already joined the event")
		}
	}

	// 参加可能な役割かチェック（効率化）
	allowedRolesMap := make(map[UserRole]bool)
	for _, allowedRole := range e.AllowedParticipationRoles {
		allowedRolesMap[allowedRole] = true
	}

	hasAllowedRole := false
	for _, userRole := range user.Roles {
		if allowedRolesMap[userRole] {
			hasAllowedRole = true
			break
		}
	}

	if !hasAllowedRole {
		return fmt.Errorf("user does not have required roles to join this event")
	}

	// 今日以降のイベントかどうかチェック
	if e.ConfirmedDate != nil {
		now := time.Now()
		today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

		if e.ConfirmedDate.Before(today) {
			return fmt.Errorf("cannot join past events")
		}
	}

	// 参加者を追加
	participant := EventParticipant{
		UserID:     user.UserID,
		Generation: user.Generation,
		JoinedAt:   time.Now(),
		Status:     EventParticipantStatusPending, // 参加者は保留中
	}
	e.Participants = append(e.Participants, participant)
	e.UpdatedAt = time.Now()
	return nil
}

func (e *Event) LeaveEvent(user *User) error {
	// 参加可能な役割かチェック（効率化）
	allowedRolesMap := make(map[UserRole]bool)
	for _, allowedRole := range e.AllowedParticipationRoles {
		allowedRolesMap[allowedRole] = true
	}

	hasAllowedRole := false
	for _, userRole := range user.Roles {
		if allowedRolesMap[userRole] {
			hasAllowedRole = true
			break
		}
	}

	if !hasAllowedRole {
		return fmt.Errorf("user does not have required roles to join this event")
	}
	for i, p := range e.Participants {
		if p.UserID == user.UserID {
			// 参加者を削除
			e.Participants = append(e.Participants[:i], e.Participants[i+1:]...)
			e.UpdatedAt = time.Now()
			return nil
		}
	}
	return fmt.Errorf("user not found in participants")
}

func (e *Event) GetParticipants() []EventParticipant {
	return e.Participants
}

func (e *Event) IsParticipant(userID string) bool {
	for _, p := range e.Participants {
		if p.UserID == userID {
			return true
		}
	}
	return false
}
