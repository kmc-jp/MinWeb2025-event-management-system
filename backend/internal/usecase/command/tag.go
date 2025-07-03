package command

import (
	"context"
	"errors"
	"event-management-system/backend/internal/domain/model"
	"event-management-system/backend/internal/domain/repository_interface"
)

// CreateTagCommand はタグ作成のコマンドを表します
type CreateTagCommand struct {
	Name      string
	CreatedBy string
}

// TagCommandUsecase はタグコマンドのユースケース
type TagCommandUsecase struct {
	TagRepo repository_interface.TagRepository
}

// NewTagCommandUsecase は新しいタグコマンドユースケースを作成
func NewTagCommandUsecase(tr repository_interface.TagRepository) *TagCommandUsecase {
	return &TagCommandUsecase{
		TagRepo: tr,
	}
}

// CreateTag は新しいタグを作成します
func (uc *TagCommandUsecase) CreateTag(ctx context.Context, cmd *CreateTagCommand) error {
	// タグ名のバリデーション
	if cmd.Name == "" {
		return errors.New("tag name is required")
	}
	if len(cmd.Name) > 50 {
		return errors.New("tag name is too long")
	}

	// 既存のタグとの重複チェック
	exists, err := uc.TagRepo.Exists(ctx, cmd.Name)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("tag already exists")
	}

	// タグを作成
	tag := model.NewTagEntity(cmd.Name, cmd.CreatedBy)

	// 保存
	return uc.TagRepo.Save(ctx, tag)
}
