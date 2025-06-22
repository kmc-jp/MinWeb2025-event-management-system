package entity

import (
	"fmt"
	"time"
)

// SchedulePoll は日程調整機能を表すエンティティです
type SchedulePoll struct {
	pollID        string
	pollType      string
	candidateDates []time.Time
	responses     []PollResponse
	finalizedDate *time.Time
}

// PollResponse は日程調整への回答を表します
type PollResponse struct {
	userID   string
	userName string
	responses []DateResponse
}

// DateResponse は特定の日付への回答を表します
type DateResponse struct {
	date      time.Time
	available bool
}

// NewSchedulePoll は新しいSchedulePollを作成します
func NewSchedulePoll(pollType string, candidateDates []time.Time) (*SchedulePoll, error) {
	if pollType == "" {
		return nil, fmt.Errorf("poll type cannot be empty")
	}
	if len(candidateDates) == 0 {
		return nil, fmt.Errorf("candidate dates cannot be empty")
	}

	// 候補日をソート
	for i := 0; i < len(candidateDates)-1; i++ {
		for j := i + 1; j < len(candidateDates); j++ {
			if candidateDates[i].After(candidateDates[j]) {
				candidateDates[i], candidateDates[j] = candidateDates[j], candidateDates[i]
			}
		}
	}

	return &SchedulePoll{
		pollID:        generatePollID(),
		pollType:      pollType,
		candidateDates: candidateDates,
		responses:     []PollResponse{},
		finalizedDate: nil,
	}, nil
}

// PollID は投票IDを返します
func (sp *SchedulePoll) PollID() string {
	return sp.pollID
}

// PollType は投票タイプを返します
func (sp *SchedulePoll) PollType() string {
	return sp.pollType
}

// CandidateDates は候補日を返します
func (sp *SchedulePoll) CandidateDates() []time.Time {
	return sp.candidateDates
}

// Responses は回答を返します
func (sp *SchedulePoll) Responses() []PollResponse {
	return sp.responses
}

// FinalizedDate は確定日時を返します
func (sp *SchedulePoll) FinalizedDate() *time.Time {
	return sp.finalizedDate
}

// AddResponse は日程調整への回答を追加します
func (sp *SchedulePoll) AddResponse(userID, userName string, responses []DateResponse) error {
	// 既存の回答をチェック
	for _, existingResponse := range sp.responses {
		if existingResponse.userID == userID {
			return fmt.Errorf("user %s has already responded", userID)
		}
	}

	// 回答の日付が候補日と一致するかチェック
	for _, response := range responses {
		found := false
		for _, candidateDate := range sp.candidateDates {
			if response.date.Equal(candidateDate) {
				found = true
				break
			}
		}
		if !found {
			return fmt.Errorf("date %s is not a candidate date", response.date.Format(time.RFC3339))
		}
	}

	pollResponse := PollResponse{
		userID:    userID,
		userName:  userName,
		responses: responses,
	}

	sp.responses = append(sp.responses, pollResponse)
	return nil
}

// FinalizeSchedule は日程を確定します
func (sp *SchedulePoll) FinalizeSchedule(finalizedDate time.Time) error {
	// 確定日が候補日と一致するかチェック
	found := false
	for _, candidateDate := range sp.candidateDates {
		if finalizedDate.Equal(candidateDate) {
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("finalized date %s is not a candidate date", finalizedDate.Format(time.RFC3339))
	}

	sp.finalizedDate = &finalizedDate
	return nil
}

// IsFinalized は日程が確定済みかどうかをチェックします
func (sp *SchedulePoll) IsFinalized() bool {
	return sp.finalizedDate != nil
}

// GetAvailabilitySummary は各候補日の参加可能人数を返します
func (sp *SchedulePoll) GetAvailabilitySummary() map[time.Time]int {
	summary := make(map[time.Time]int)
	
	// 候補日を初期化
	for _, date := range sp.candidateDates {
		summary[date] = 0
	}

	// 回答を集計
	for _, response := range sp.responses {
		for _, dateResponse := range response.responses {
			if dateResponse.available {
				summary[dateResponse.date]++
			}
		}
	}

	return summary
}

// generatePollID は投票IDを生成します
func generatePollID() string {
	return fmt.Sprintf("poll_%d", time.Now().UnixNano())
} 