package command

import (
	"context"
	"event-management-system/backend/internal/domain/model"
	"event-management-system/backend/internal/domain/repository_interface"
	"time"
)

// CreateEventCommand はイベント作成のコマンドを表します
// CQRSパターンに従い、書き込み操作をコマンドとして定義します
type CreateEventCommand struct {
	OrganizerID      string
	Title            string
	Description      string
	Venue            string
	AllowedRoles     []model.UserRole
	EditableRoles    []model.UserRole
	AllowedUsers     []string
	Tags             []model.Tag
	FeeSettings      []model.FeeSetting
	PollType         string
	PollCandidates   []time.Time
	ConfirmedDate    *time.Time
	ScheduleDeadline *time.Time
}

// UpdateEventCommand はイベント更新のコマンドを表します
type UpdateEventCommand struct {
	EventID       string
	Title         string
	Description   string
	Venue         string
	AllowedRoles  []model.UserRole
	EditableRoles []model.UserRole
	Tags          []model.Tag
	FeeSettings   []model.FeeSetting
}

// DeleteEventCommand はイベント削除のコマンドを表します
type DeleteEventCommand struct {
	EventID string
}

// JoinEventCommand はイベント参加のコマンドを表します
type JoinEventCommand struct {
	EventID string
	UserID  string
}

// LeaveEventCommand はイベント退出のコマンドを表します
type LeaveEventCommand struct {
	EventID string
	UserID  string
}

// EventCommandUsecase はイベントコマンドのユースケースを実装します
type EventCommandUsecase struct {
	EventRepo repository_interface.EventRepository
	UserRepo  repository_interface.UserRepository
}

// NewEventCommandUsecase は新しいイベントコマンドユースケースを作成します
func NewEventCommandUsecase(er repository_interface.EventRepository, ur repository_interface.UserRepository) *EventCommandUsecase {
	return &EventCommandUsecase{EventRepo: er, UserRepo: ur}
}

// CreateEvent はイベントを作成します
// ドメインロジックをオーケストレーションし、リポジトリを通じて永続化します
func (uc *EventCommandUsecase) CreateEvent(ctx context.Context, cmd *CreateEventCommand) (string, error) {
	organizer, err := uc.UserRepo.FindByID(ctx, cmd.OrganizerID)
	if err != nil {
		return "", err
	}
	event := model.NewEvent(organizer, cmd.Title, cmd.Description, cmd.Venue, cmd.AllowedRoles, cmd.EditableRoles, cmd.AllowedUsers, cmd.Tags, cmd.FeeSettings, cmd.PollType, cmd.PollCandidates, cmd.ConfirmedDate, cmd.ScheduleDeadline)
	if err := uc.EventRepo.Save(ctx, event); err != nil {
		return "", err
	}
	return event.EventID, nil
}

// UpdateEvent はイベントを更新します
func (uc *EventCommandUsecase) UpdateEvent(ctx context.Context, cmd *UpdateEventCommand) error {
	event, err := uc.EventRepo.FindByID(ctx, cmd.EventID)
	if err != nil {
		return err
	}

	event.UpdateDetails(cmd.Title, cmd.Description, cmd.Venue, cmd.AllowedRoles, cmd.EditableRoles, cmd.Tags, cmd.FeeSettings)

	if err := uc.EventRepo.Save(ctx, event); err != nil {
		return err
	}
	return nil
}

// DeleteEvent はイベントを削除します
func (uc *EventCommandUsecase) DeleteEvent(ctx context.Context, cmd *DeleteEventCommand) error {
	return uc.EventRepo.Delete(ctx, cmd.EventID)
}

// JoinEvent はイベントに参加します
func (uc *EventCommandUsecase) JoinEvent(ctx context.Context, cmd *JoinEventCommand) error {
	event, err := uc.EventRepo.FindByID(ctx, cmd.EventID)
	if err != nil {
		return err
	}

	user, err := uc.UserRepo.FindByID(ctx, cmd.UserID)
	if err != nil {
		return err
	}

	if err := event.JoinEvent(user); err != nil {
		return err
	}

	return uc.EventRepo.Save(ctx, event)
}

// LeaveEvent はイベントから退出します
func (uc *EventCommandUsecase) LeaveEvent(ctx context.Context, cmd *LeaveEventCommand) error {
	event, err := uc.EventRepo.FindByID(ctx, cmd.EventID)
	if err != nil {
		return err
	}

	user, err := uc.UserRepo.FindByID(ctx, cmd.UserID)
	if err != nil {
		return err
	}

	if err := event.LeaveEvent(user); err != nil {
		return err
	}

	return uc.EventRepo.Save(ctx, event)
}

// 他のコマンド（Update, Publish, Cancel, FinalizeSchedule など）も同様に追加可能
