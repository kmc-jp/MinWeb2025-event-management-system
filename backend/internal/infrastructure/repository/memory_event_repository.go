package repository

import (
	"context"
	"sync"

	"event-management-system/backend/internal/domain/aggregate"
	"event-management-system/backend/internal/domain/repository"
)

type MemoryEventRepository struct {
	mu     sync.RWMutex
	events map[string]*aggregate.Event
}

func NewMemoryEventRepository() repository.EventRepository {
	return &MemoryEventRepository{
		events: make(map[string]*aggregate.Event),
	}
}

func (r *MemoryEventRepository) Save(ctx context.Context, event *aggregate.Event) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.events[event.ID] = event
	return nil
}

func (r *MemoryEventRepository) FindByID(ctx context.Context, id string) (*aggregate.Event, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	event, ok := r.events[id]
	if !ok {
		return nil, nil
	}
	return event, nil
}

func (r *MemoryEventRepository) FindAll(ctx context.Context) ([]*aggregate.Event, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var result []*aggregate.Event
	for _, e := range r.events {
		result = append(result, e)
	}
	return result, nil
}

func (r *MemoryEventRepository) FindByStatus(ctx context.Context, status aggregate.EventStatus) ([]*aggregate.Event, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var result []*aggregate.Event
	for _, e := range r.events {
		if e.Status == status {
			result = append(result, e)
		}
	}
	return result, nil
}

func (r *MemoryEventRepository) Delete(ctx context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.events, id)
	return nil
} 