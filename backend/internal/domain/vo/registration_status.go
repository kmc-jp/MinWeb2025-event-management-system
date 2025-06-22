package vo

import (
	"fmt"
)

// RegistrationStatus は参加登録の状態を表す値オブジェクトです
type RegistrationStatus string

const (
	RegistrationStatusRegistered RegistrationStatus = "REGISTERED"
	RegistrationStatusCancelled  RegistrationStatus = "CANCELLED"
)

// String はRegistrationStatusの文字列表現を返します
func (s RegistrationStatus) String() string {
	return string(s)
}

// IsValid はRegistrationStatusが有効な値かどうかをチェックします
func (s RegistrationStatus) IsValid() bool {
	switch s {
	case RegistrationStatusRegistered, RegistrationStatusCancelled:
		return true
	default:
		return false
	}
}

// CanTransitionTo は指定されたステータスへの遷移が可能かどうかをチェックします
func (s RegistrationStatus) CanTransitionTo(target RegistrationStatus) bool {
	switch s {
	case RegistrationStatusRegistered:
		return target == RegistrationStatusCancelled
	case RegistrationStatusCancelled:
		return false // キャンセル済み登録は他のステータスに遷移できない
	default:
		return false
	}
}

// NewRegistrationStatus は新しいRegistrationStatusを作成します
func NewRegistrationStatus(status string) (RegistrationStatus, error) {
	registrationStatus := RegistrationStatus(status)
	if !registrationStatus.IsValid() {
		return "", fmt.Errorf("invalid registration status: %s", status)
	}
	return registrationStatus, nil
} 