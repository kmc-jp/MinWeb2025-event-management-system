package command

import (
	"context"
	"event-management-system/backend/internal/domain/repository"
)

// RegisterForEventCommand はイベント参加登録コマンドです
type RegisterForEventCommand struct {
	EventID string `json:"eventId"`
}

// RegisterForEventResult は参加登録結果です
type RegisterForEventResult struct {
	RegistrationID string `json:"registrationId"`
}

// RegisterForEventCommandHandler はイベント参加登録コマンドを処理します
type RegisterForEventCommandHandler struct {
	eventRepo repository.EventRepository
	userRepo  repository.UserRepository
}

// NewRegisterForEventCommandHandler は新しいRegisterForEventCommandHandlerを作成します
func NewRegisterForEventCommandHandler(eventRepo repository.EventRepository, userRepo repository.UserRepository) *RegisterForEventCommandHandler {
	return &RegisterForEventCommandHandler{
		eventRepo: eventRepo,
		userRepo:  userRepo,
	}
}

// Handle はコマンドを実行します
func (h *RegisterForEventCommandHandler) Handle(ctx context.Context, cmd RegisterForEventCommand, userID string) (*RegisterForEventResult, error) {
	// 1. イベントを取得
	event, err := h.eventRepo.FindByID(ctx, cmd.EventID)
	if err != nil {
		return nil, err
	}

	// 2. ユーザーを取得
	user, err := h.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// 3. 参加登録を追加
	registration, err := event.AddRegistration(user)
	if err != nil {
		return nil, err
	}

	// 4. イベントを保存（参加登録が追加された状態で）
	if err := h.eventRepo.Save(ctx, event); err != nil {
		return nil, err
	}

	return &RegisterForEventResult{
		RegistrationID: registration.RegistrationID(),
	}, nil
} 