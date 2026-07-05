package tenant

import "time"

type PanelType string

const (
	PanelMarketing PanelType = "marketing"
	PanelGym       PanelType = "gym"
	PanelCoach     PanelType = "coach"
	PanelAthlete   PanelType = "athlete"
	PanelAdmin     PanelType = "admin"
)

type Status string

const (
	StatusActive   Status = "active"
	StatusPending  Status = "pending"
	StatusSuspended Status = "suspended"
)

type Tenant struct {
	ID        string
	Slug      string
	Name      string
	Subdomain string
	PanelType PanelType
	Status    Status
	CreatedAt time.Time
	UpdatedAt time.Time
}

