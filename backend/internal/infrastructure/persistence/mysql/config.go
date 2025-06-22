package mysql

import (
	"fmt"
	"os"
)

// Config はMySQL接続設定を表します
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string
	Charset  string
}

// NewConfig は環境変数からMySQL設定を作成します
func NewConfig() *Config {
	return &Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "3306"),
		User:     getEnv("DB_USER", "events_user"),
		Password: getEnv("DB_PASSWORD", "events_password"),
		Database: getEnv("DB_DATABASE", "events_db"),
		Charset:  getEnv("DB_CHARSET", "utf8mb4"),
	}
}

// DSN はデータソース名を生成します
func (c *Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=true&loc=Local",
		c.User,
		c.Password,
		c.Host,
		c.Port,
		c.Database,
		c.Charset,
	)
}

// getEnv は環境変数を取得し、デフォルト値を返します
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
