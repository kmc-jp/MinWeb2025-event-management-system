package model

import (
	"time"

	"github.com/google/uuid"
)

// EventStatus: イベントのライフサイクル状態
// DRAFT, SCHEDULE_POLLING, CONFIRMED, FINISHED, CANCELLED

type EventStatus string

const (
	EventStatusDraft        EventStatus = "DRAFT"
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

// FeeSetting: 役割・世代ごとの料金ルール

type FeeSetting struct {
	ApplicableRole       UserRole
	ApplicableGeneration string
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

// Event: イベント集約

type Event struct {
	EventID      string
	Organizer    *User
	Title        string
	Description  string
	Status       EventStatus
	AllowedRoles []UserRole
	Tags         []Tag
	Venue        string
	SchedulePoll *SchedulePoll
	FeeSettings  []FeeSetting
	Comments     []Comment
	EventReports []EventReport
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// --- ファクトリ・振る舞い ---

func NewEvent(organizer *User, title, description, venue string, allowedRoles []UserRole, tags []Tag, feeSettings []FeeSetting, pollType string, pollCandidates []time.Time) *Event {
	now := time.Now()
	return &Event{
		EventID:      uuid.New().String(),
		Organizer:    organizer,
		Title:        title,
		Description:  description,
		Status:       EventStatusDraft,
		AllowedRoles: allowedRoles,
		Tags:         tags,
		Venue:        venue,
		SchedulePoll: &SchedulePoll{
			PollType:       pollType,
			CandidateDates: pollCandidates,
			Responses:      make(map[string][]time.Time),
		},
		FeeSettings:  feeSettings,
		Comments:     []Comment{},
		EventReports: []EventReport{},
		CreatedAt:    now,
		UpdatedAt:    now,
	}
}

func (e *Event) UpdateDetails(title, description, venue string, allowedRoles []UserRole, tags []Tag, feeSettings []FeeSetting) {
	e.Title = title
	e.Description = description
	e.Venue = venue
	e.AllowedRoles = allowedRoles
	e.Tags = tags
	e.FeeSettings = feeSettings
	e.UpdatedAt = time.Now()
}

func (e *Event) StartSchedulePolling() {
	e.Status = EventStatusSchedulePoll
	e.UpdatedAt = time.Now()
}

func (e *Event) ConfirmSchedule(finalDate time.Time) {
	if e.SchedulePoll != nil {
		e.SchedulePoll.FinalizedDate = &finalDate
	}
	e.Status = EventStatusConfirmed
	e.UpdatedAt = time.Now()
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
		if fs.ApplicableRole == user.Role && fs.ApplicableGeneration == user.Generation {
			return &fs.Fee
		}
	}
	return nil
}
