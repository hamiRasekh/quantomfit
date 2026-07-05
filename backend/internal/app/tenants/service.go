package tenants

import "quantomfit/backend/internal/domain/tenant"

type Service struct {
	current tenant.Tenant
}

func NewService(current tenant.Tenant) *Service {
	return &Service{current: current}
}

func (s *Service) Current() tenant.Tenant {
	return s.current
}

