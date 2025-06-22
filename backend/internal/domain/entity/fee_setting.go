package entity

import (
	"fmt"
	"event-management-system/backend/internal/domain/vo"
)

// FeeSetting は特定の役割・世代に対する料金ルールを表すエンティティです
type FeeSetting struct {
	applicableRole      string
	applicableGeneration *string
	fee                 vo.Money
}

// NewFeeSetting は新しいFeeSettingを作成します
func NewFeeSetting(applicableRole string, applicableGeneration *string, fee vo.Money) (*FeeSetting, error) {
	if applicableRole == "" {
		return nil, fmt.Errorf("applicable role cannot be empty")
	}

	return &FeeSetting{
		applicableRole:      applicableRole,
		applicableGeneration: applicableGeneration,
		fee:                 fee,
	}, nil
}

// ApplicableRole は適用対象の役割を返します
func (fs *FeeSetting) ApplicableRole() string {
	return fs.applicableRole
}

// ApplicableGeneration は適用対象の世代を返します
func (fs *FeeSetting) ApplicableGeneration() *string {
	return fs.applicableGeneration
}

// Fee は料金を返します
func (fs *FeeSetting) Fee() vo.Money {
	return fs.fee
}

// IsApplicableTo は指定された役割と世代に適用可能かどうかをチェックします
func (fs *FeeSetting) IsApplicableTo(role, generation string) bool {
	if fs.applicableRole != role {
		return false
	}

	// 世代が指定されていない場合は、すべての世代に適用
	if fs.applicableGeneration == nil {
		return true
	}

	// 世代が指定されている場合は、完全一致が必要
	return *fs.applicableGeneration == generation
}

// String はFeeSettingの文字列表現を返します
func (fs *FeeSetting) String() string {
	if fs.applicableGeneration == nil {
		return fmt.Sprintf("%s: %s", fs.applicableRole, fs.fee.FormatJPY())
	}
	return fmt.Sprintf("%s (%s): %s", fs.applicableRole, *fs.applicableGeneration, fs.fee.FormatJPY())
} 