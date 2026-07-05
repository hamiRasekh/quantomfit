package gyms

import (
	"context"
	"errors"
	"strings"
	"sync"
	"time"

	"quantomfit/backend/internal/domain/gym"
)

var ErrNotFound = errors.New("gym not found")

type CreateInput struct {
	Name      string
	Slug      string
	Subdomain string
	PlanCode  string
}

type Service struct {
	mu    sync.RWMutex
	items map[string]gym.Gym
}

func NewService() *Service {
	return &Service{items: map[string]gym.Gym{}}
}

func (s *Service) Create(_ context.Context, tenantID, ownerUserID string, input CreateInput) gym.Gym {
	now := time.Now().UTC()
	id := tenantID
	if id == "" {
		id = strings.ToLower(strings.ReplaceAll(input.Slug, " ", "-"))
	}

	item := gym.Gym{
		ID:          id,
		TenantID:    id,
		Name:        input.Name,
		Slug:        input.Slug,
		Subdomain:   input.Subdomain,
		OwnerUserID: ownerUserID,
		PlanCode:    input.PlanCode,
		Onboarding:  gym.OnboardingPending,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.items[id] = item
	return item
}

func (s *Service) List(_ context.Context) []gym.Gym {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]gym.Gym, 0, len(s.items))
	for _, item := range s.items {
		out = append(out, item)
	}
	return out
}

func (s *Service) Get(_ context.Context, tenantID string) (gym.Gym, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, ok := s.items[tenantID]
	return item, ok
}

