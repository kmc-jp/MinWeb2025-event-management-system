package vo

import (
	"fmt"
	"strconv"
)

// Money は金額と通貨を扱う値オブジェクトです
type Money struct {
	amount   int
	currency string
}

// NewMoney は新しいMoneyを作成します
func NewMoney(amount int, currency string) (Money, error) {
	if amount < 0 {
		return Money{}, fmt.Errorf("amount cannot be negative: %d", amount)
	}
	if currency == "" {
		return Money{}, fmt.Errorf("currency cannot be empty")
	}
	return Money{amount: amount, currency: currency}, nil
}

// NewJPY は日本円のMoneyを作成します
func NewJPY(amount int) (Money, error) {
	return NewMoney(amount, "JPY")
}

// Amount は金額を返します
func (m Money) Amount() int {
	return m.amount
}

// Currency は通貨を返します
func (m Money) Currency() string {
	return m.currency
}

// String はMoneyの文字列表現を返します
func (m Money) String() string {
	return fmt.Sprintf("%d %s", m.amount, m.currency)
}

// FormatJPY は日本円としてフォーマットされた文字列を返します
func (m Money) FormatJPY() string {
	if m.currency != "JPY" {
		return m.String()
	}
	return fmt.Sprintf("¥%s", strconv.Itoa(m.amount))
}

// Add は他のMoneyを加算します（同じ通貨の場合のみ）
func (m Money) Add(other Money) (Money, error) {
	if m.currency != other.currency {
		return Money{}, fmt.Errorf("cannot add different currencies: %s and %s", m.currency, other.currency)
	}
	return NewMoney(m.amount+other.amount, m.currency)
}

// Subtract は他のMoneyを減算します（同じ通貨の場合のみ）
func (m Money) Subtract(other Money) (Money, error) {
	if m.currency != other.currency {
		return Money{}, fmt.Errorf("cannot subtract different currencies: %s and %s", m.currency, other.currency)
	}
	if m.amount < other.amount {
		return Money{}, fmt.Errorf("result would be negative")
	}
	return NewMoney(m.amount-other.amount, m.currency)
}

// Equals は他のMoneyと等しいかどうかをチェックします
func (m Money) Equals(other Money) bool {
	return m.amount == other.amount && m.currency == other.currency
} 