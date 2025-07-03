package in_memory

import (
	"context"
	"event-management-system/backend/internal/domain/model"
	"sync"
)

// InMemoryEventRepository はEventRepositoryのインメモリ実装
type InMemoryEventRepository struct {
	events map[string]*model.Event
	mutex  sync.RWMutex
}

// NewInMemoryEventRepository は新しいインメモリイベントリポジトリを作成
func NewInMemoryEventRepository() *InMemoryEventRepository {
	return &InMemoryEventRepository{
		events: make(map[string]*model.Event),
	}
}

// Save はイベントを保存または更新
func (r *InMemoryEventRepository) Save(ctx context.Context, event *model.Event) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	r.events[event.EventID] = event
	return nil
}

// FindByID は指定されたIDのイベントを取得
func (r *InMemoryEventRepository) FindByID(ctx context.Context, id string) (*model.Event, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	event, exists := r.events[id]
	if !exists {
		return nil, ErrEventNotFound
	}
	return event, nil
}

// FindAll は全てのイベントを取得
func (r *InMemoryEventRepository) FindAll(ctx context.Context) ([]*model.Event, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	events := make([]*model.Event, 0, len(r.events))
	for _, event := range r.events {
		events = append(events, event)
	}
	return events, nil
}

// FindByStatus は指定されたステータスのイベントを取得
func (r *InMemoryEventRepository) FindByStatus(ctx context.Context, status model.EventStatus) ([]*model.Event, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	var events []*model.Event
	for _, event := range r.events {
		if event.Status == status {
			events = append(events, event)
		}
	}
	return events, nil
}

// Delete は指定されたIDのイベントを削除
func (r *InMemoryEventRepository) Delete(ctx context.Context, id string) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	delete(r.events, id)
	return nil
}

// ErrEventNotFound はイベントが見つからないエラー
var ErrEventNotFound = &EventNotFoundError{}

type EventNotFoundError struct{}

func (e *EventNotFoundError) Error() string {
	return "event not found"
}
