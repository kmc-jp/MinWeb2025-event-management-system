package command

import (
	"context"
	"time"
	"event-management-system/backend/internal/domain/aggregate"
	"event-management-system/backend/internal/domain/entity"
	"event-management-system/backend/internal/domain/repository"
	"event-management-system/backend/internal/domain/vo"
)

// CreateEventCommand はイベント作成コマンドです
type CreateEventCommand struct {
	Title         string      `json:"title"`
	Description   string      `json:"description"`
	Venue         string      `json:"venue"`
	AllowedRoles  []string    `json:"allowedRoles"`
	Tags          []string    `json:"tags"`
	FeeSettings   []FeeSettingInput `json:"feeSettings"`
	PollCandidates []time.Time `json:"pollCandidates"`
	OrganizerID   string      `json:"organizerId"`
	OrganizerName string      `json:"organizerName"`
}

// FeeSettingInput は料金設定の入力データです
type FeeSettingInput struct {
	ApplicableRole      string  `json:"applicableRole"`
	ApplicableGeneration *string `json:"applicableGeneration,omitempty"`
	Fee                 MoneyInput `json:"fee"`
}

// MoneyInput は金額の入力データです
type MoneyInput struct {
	Amount   int    `json:"amount"`
	Currency string `json:"currency"`
}

// CreateEventResult イベント作成結果
type CreateEventResult struct {
	EventID string `json:"eventId"`
}

// CreateEventCommandHandler はイベント作成コマンドを処理します
type CreateEventCommandHandler struct {
	eventRepo repository.EventRepository
	userRepo  repository.UserRepository
}

// NewCreateEventCommandHandler は新しいCreateEventCommandHandlerを作成します
func NewCreateEventCommandHandler(eventRepo repository.EventRepository, userRepo repository.UserRepository) *CreateEventCommandHandler {
	return &CreateEventCommandHandler{
		eventRepo: eventRepo,
		userRepo:  userRepo,
	}
}

// Handle はコマンドを実行します
func (h *CreateEventCommandHandler) Handle(ctx context.Context, cmd CreateEventCommand, userID string) (*CreateEventResult, error) {
	// 1. userID を使って User オブジェクトを取得
	organizer, err := h.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err // ユーザーが存在しないエラー
	}

	// 2. 料金設定を変換
	feeSettings, err := h.convertFeeSettings(cmd.FeeSettings)
	if err != nil {
		return nil, err
	}

	// 3. Event集約のファクトリ関数を呼び出す
	event, err := aggregate.NewEvent(
		organizer,
		cmd.Title,
		cmd.Description,
		cmd.Venue,
		cmd.AllowedRoles,
		cmd.Tags,
		feeSettings,
		cmd.PollCandidates,
	)
	if err != nil {
		return nil, err
	}

	// 4. リポジトリで永続化
	if err := h.eventRepo.Save(ctx, event); err != nil {
		return nil, err
	}

	return &CreateEventResult{
		EventID: event.EventID(),
	}, nil
}

// convertFeeSettings は料金設定の入力データをドメインオブジェクトに変換します
func (h *CreateEventCommandHandler) convertFeeSettings(inputs []FeeSettingInput) ([]*entity.FeeSetting, error) {
	var feeSettings []*entity.FeeSetting

	for _, input := range inputs {
		// Money値オブジェクトを作成
		money, err := vo.NewMoney(input.Fee.Amount, input.Fee.Currency)
		if err != nil {
			return nil, err
		}

		// FeeSettingエンティティを作成
		feeSetting, err := entity.NewFeeSetting(input.ApplicableRole, input.ApplicableGeneration, money)
		if err != nil {
			return nil, err
		}

		feeSettings = append(feeSettings, feeSetting)
	}

	return feeSettings, nil
} 