package health

import "time"

type Service struct {
	startedAt time.Time
}

func NewService(startedAt time.Time) *Service {
	return &Service{startedAt: startedAt.UTC()}
}

type Status struct {
	Status    string    `json:"status"`
	StartedAt time.Time `json:"startedAt"`
	UptimeSec int64     `json:"uptimeSec"`
}

func (s *Service) Status() Status {
	return Status{
		Status:    "healthy",
		StartedAt: s.startedAt,
		UptimeSec: int64(time.Since(s.startedAt).Seconds()),
	}
}

