package query

import (
	"context"
	"event-management-system/backend/internal/domain/repository"
)

// GetEventDetailsQuery はイベント詳細取得クエリです
type GetEventDetailsQuery struct {
	EventID string `json:"eventId"`
}

// EventDetailsDTO はイベント詳細のDTOです
type EventDetailsDTO struct {
	ID          string                `json:"id"`
	Title       string                `json:"title"`
	Description string                `json:"description"`
	Status      string                `json:"status"`
	Organizer   UserSummaryDTO        `json:"organizer"`
	Venue       string                `json:"venue"`
	AllowedRoles []string             `json:"allowedRoles"`
	Tags        []string              `json:"tags"`
	SchedulePoll SchedulePollDTO      `json:"schedulePoll"`
	FeeSettings []FeeSettingDTO       `json:"feeSettings"`
	Registrations []RegistrationDTO   `json:"registrations"`
}

// UserSummaryDTO はユーザー概要のDTOです
type UserSummaryDTO struct {
	UserID     string `json:"userId"`
	Name       string `json:"name"`
	Generation string `json:"generation"`
}

// SchedulePollDTO は日程調整のDTOです
type SchedulePollDTO struct {
	PollID         string           `json:"pollId"`
	PollType       string           `json:"pollType"`
	CandidateDates []string         `json:"candidateDates"`
	Responses      []PollResponseDTO `json:"responses"`
	FinalizedDate  *string          `json:"finalizedDate,omitempty"`
}

// PollResponseDTO は日程調整回答のDTOです
type PollResponseDTO struct {
	UserID    string `json:"userId"`
	UserName  string `json:"userName"`
	Date      string `json:"date"`
	Available bool   `json:"available"`
}

// FeeSettingDTO は料金設定のDTOです
type FeeSettingDTO struct {
	ApplicableRole      string  `json:"applicableRole"`
	ApplicableGeneration *string `json:"applicableGeneration,omitempty"`
	Fee                 MoneyDTO `json:"fee"`
}

// MoneyDTO は金額のDTOです
type MoneyDTO struct {
	Amount   int    `json:"amount"`
	Currency string `json:"currency"`
}

// RegistrationDTO は参加登録のDTOです
type RegistrationDTO struct {
	RegistrationID string    `json:"registrationId"`
	User           UserSummaryDTO `json:"user"`
	Status         string    `json:"status"`
	AppliedFee     MoneyDTO  `json:"appliedFee"`
	RegisteredAt   string    `json:"registeredAt"`
}

// GetEventDetailsQueryHandler はイベント詳細取得クエリを処理します
type GetEventDetailsQueryHandler struct {
	eventRepo repository.EventRepository
}

// NewGetEventDetailsQueryHandler は新しいGetEventDetailsQueryHandlerを作成します
func NewGetEventDetailsQueryHandler(eventRepo repository.EventRepository) *GetEventDetailsQueryHandler {
	return &GetEventDetailsQueryHandler{
		eventRepo: eventRepo,
	}
}

// Handle はクエリを実行します
func (h *GetEventDetailsQueryHandler) Handle(ctx context.Context, query GetEventDetailsQuery) (*EventDetailsDTO, error) {
	// イベントを取得
	event, err := h.eventRepo.FindByID(ctx, query.EventID)
	if err != nil {
		return nil, err
	}

	// 日程調整情報を変換
	schedulePoll := SchedulePollDTO{
		PollID:         event.SchedulePoll().PollID(),
		PollType:       event.SchedulePoll().PollType(),
		CandidateDates: make([]string, 0),
		Responses:      make([]PollResponseDTO, 0),
	}

	// 候補日を変換
	for _, date := range event.SchedulePoll().CandidateDates() {
		schedulePoll.CandidateDates = append(schedulePoll.CandidateDates, date.Format("2006-01-02T15:04:05Z"))
	}

	// 確定日を設定
	if event.SchedulePoll().FinalizedDate() != nil {
		finalizedDate := event.SchedulePoll().FinalizedDate().Format("2006-01-02T15:04:05Z")
		schedulePoll.FinalizedDate = &finalizedDate
	}

	// 料金設定を変換
	feeSettings := make([]FeeSettingDTO, len(event.FeeSettings()))
	for i, feeSetting := range event.FeeSettings() {
		feeSettings[i] = FeeSettingDTO{
			ApplicableRole:      feeSetting.ApplicableRole(),
			ApplicableGeneration: feeSetting.ApplicableGeneration(),
			Fee: MoneyDTO{
				Amount:   feeSetting.Fee().Amount(),
				Currency: feeSetting.Fee().Currency(),
			},
		}
	}

	// 参加登録を変換
	registrations := make([]RegistrationDTO, len(event.Registrations()))
	for i, registration := range event.Registrations() {
		registrations[i] = RegistrationDTO{
			RegistrationID: registration.RegistrationID(),
			User: UserSummaryDTO{
				UserID:     registration.User().UserID(),
				Name:       registration.User().Name(),
				Generation: registration.User().Generation(),
			},
			Status: registration.Status().String(),
			AppliedFee: MoneyDTO{
				Amount:   registration.AppliedFee().Amount(),
				Currency: registration.AppliedFee().Currency(),
			},
			RegisteredAt: registration.RegisteredAt().Format("2006-01-02T15:04:05Z"),
		}
	}

	return &EventDetailsDTO{
		ID:            event.EventID(),
		Title:         event.Title(),
		Description:   event.Description(),
		Status:        event.Status().String(),
		Organizer: UserSummaryDTO{
			UserID:     event.Organizer().UserID(),
			Name:       event.Organizer().Name(),
			Generation: event.Organizer().Generation(),
		},
		Venue:         event.Venue(),
		AllowedRoles:  event.AllowedRoles(),
		Tags:          event.Tags(),
		SchedulePoll:  schedulePoll,
		FeeSettings:   feeSettings,
		Registrations: registrations,
	}, nil
} 