package query

import (
	"context"
	"event-management-system/backend/internal/domain/repository_interface"
)

// TagDTO はタグ表示用のDTO
type TagDTO struct {
	Name      string `json:"name"`
	CreatedAt string `json:"created_at"`
	CreatedBy string `json:"created_by"`
}

// TagQueryUsecase はタグクエリのユースケース
type TagQueryUsecase struct {
	TagRepo repository_interface.TagRepository
}

// NewTagQueryUsecase は新しいタグクエリユースケースを作成
func NewTagQueryUsecase(tr repository_interface.TagRepository) *TagQueryUsecase {
	return &TagQueryUsecase{
		TagRepo: tr,
	}
}

// GetAllTags は全てのタグを取得
func (uc *TagQueryUsecase) GetAllTags(ctx context.Context) ([]*TagDTO, error) {
	tags, err := uc.TagRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	var tagDTOs []*TagDTO
	for _, tag := range tags {
		tagDTOs = append(tagDTOs, &TagDTO{
			Name:      tag.Name,
			CreatedAt: tag.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			CreatedBy: tag.CreatedBy,
		})
	}

	return tagDTOs, nil
}
