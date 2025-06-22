package domain

import "errors"

// ドメイン固有のエラーを定義
// これらのエラーはビジネスルール違反を表します
var (
	ErrEventNameRequired                    = errors.New("event name is required")
	ErrInvalidEventDates                    = errors.New("start date must be before end date")
	ErrEventCannotBePublished               = errors.New("event cannot be published in current status")
	ErrEventCannotBePublishedAfterStart     = errors.New("event cannot be published after start date")
	ErrEventCannotBeCancelled               = errors.New("event cannot be cancelled in current status")
	ErrEventNotFound                        = errors.New("event not found")
	ErrEventAlreadyExists                   = errors.New("event already exists")
) 