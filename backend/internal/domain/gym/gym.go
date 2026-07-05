package gym

import "time"

type OnboardingStatus string

const (
	OnboardingCreated   OnboardingStatus = "created"
	OnboardingPending   OnboardingStatus = "pending"
	OnboardingActive    OnboardingStatus = "active"
	OnboardingSuspended OnboardingStatus = "suspended"
)

type Gym struct {
	ID           string
	TenantID     string
	Name         string
	Slug         string
	Subdomain    string
	OwnerUserID  string
	PlanCode     string
	Onboarding   OnboardingStatus
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

