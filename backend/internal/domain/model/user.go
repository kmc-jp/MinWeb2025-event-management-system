package model

// UserRole はユーザーの役割を表す列挙型
// member など

type UserRole string

const (
	UserRoleMember UserRole = "member"
	UserRoleAdmin  UserRole = "admin"
)

// User はシステムを利用するユーザーを表します
// 認証は外部サービスで行われる前提

type User struct {
	UserID string // 外部サービスから連携されるID
	// Name       string     // 名前（削除）
	Roles      []UserRole // 役割リスト
	Generation int        // 世代（1-100の範囲）
}
