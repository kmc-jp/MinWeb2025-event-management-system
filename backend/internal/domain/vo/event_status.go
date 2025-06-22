package vo

import (
	"fmt"
)

// EventStatus はイベントのライフサイクル状態を表す値オブジェクトです
type EventStatus string

const (
	EventStatusDraft            EventStatus = "DRAFT"
	EventStatusSchedulePolling  EventStatus = "SCHEDULE_POLLING"
	EventStatusConfirmed        EventStatus = "CONFIRMED"
	EventStatusFinished         EventStatus = "FINISHED"
	EventStatusCancelled        EventStatus = "CANCELLED"
)

// String はEventStatusの文字列表現を返します
func (s EventStatus) String() string {
	return string(s)
}

// IsValid はEventStatusが有効な値かどうかをチェックします
func (s EventStatus) IsValid() bool {
	switch s {
	case EventStatusDraft, EventStatusSchedulePolling, EventStatusConfirmed, EventStatusFinished, EventStatusCancelled:
		return true
	default:
		return false
	}
}

// CanTransitionTo は指定されたステータスへの遷移が可能かどうかをチェックします
func (s EventStatus) CanTransitionTo(target EventStatus) bool {
	switch s {
	case EventStatusDraft:
		return target == EventStatusSchedulePolling || target == EventStatusCancelled
	case EventStatusSchedulePolling:
		return target == EventStatusConfirmed || target == EventStatusCancelled
	case EventStatusConfirmed:
		return target == EventStatusFinished || target == EventStatusCancelled
	case EventStatusFinished:
		return false // 終了済みイベントは他のステータスに遷移できない
	case EventStatusCancelled:
		return false // キャンセル済みイベントは他のステータスに遷移できない
	default:
		return false
	}
}

// NewEventStatus は新しいEventStatusを作成します
func NewEventStatus(status string) (EventStatus, error) {
	eventStatus := EventStatus(status)
	if !eventStatus.IsValid() {
		return "", fmt.Errorf("invalid event status: %s", status)
	}
	return eventStatus, nil
} 