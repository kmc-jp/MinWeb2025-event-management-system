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
	OrganizerID    string
	Title          string
	Description    string
	Venue          string
	AllowedRoles   []model.UserRole
	AllowedUsers   []string
	Tags           []model.Tag
	FeeSettings    []model.FeeSetting
	PollType       string
	PollCandidates []time.Time
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
	event := model.NewEvent(organizer, cmd.Title, cmd.Description, cmd.Venue, cmd.AllowedRoles, cmd.AllowedUsers, cmd.Tags, cmd.FeeSettings, cmd.PollType, cmd.PollCandidates)
	if err := uc.EventRepo.Save(ctx, event); err != nil {
		return "", err
	}
	return event.EventID, nil
}

// 他のコマンド（Update, Publish, Cancel, FinalizeSchedule など）も同様に追加可能
