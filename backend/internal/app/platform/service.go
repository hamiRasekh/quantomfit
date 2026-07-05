package platform

import (
	"time"

	"quantomfit/backend/internal/domain"
)

type Service struct {
	platform domain.Platform
}

func NewService(platform domain.Platform) *Service {
	return &Service{platform: platform}
}

type Info struct {
	Name      string    `json:"name"`
	Version   string    `json:"version"`
	Env       string    `json:"env"`
	BuiltAt   time.Time `json:"builtAt"`
	StartedAt time.Time `json:"startedAt"`
}

func (s *Service) Info() Info {
	return Info{
		Name:      s.platform.Name,
		Version:   s.platform.Version,
		Env:       s.platform.Env,
		BuiltAt:   s.platform.BuiltAt,
		StartedAt: s.platform.StartedAt,
	}
}

