package model

// UserRole はユーザーの役割を表す列挙型
// CircleAdmin, RegularMember, Alumni, External など

type UserRole string

const (
	UserRoleCircleAdmin   UserRole = "CircleAdmin"
	UserRoleRegularMember UserRole = "RegularMember"
	UserRoleAlumni        UserRole = "Alumni"
	UserRoleExternal      UserRole = "External"
)

// User はシステムを利用するユーザーを表します
// 認証は外部サービスで行われる前提

type User struct {
	UserID     string   // 外部サービスから連携されるID
	Name       string   // 名前
	Role       UserRole // 役割
	Generation string   // 世代（例: "2023", "2024"）
}
