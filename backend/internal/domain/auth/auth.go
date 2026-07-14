package auth

type Role string

const (
	RoleAdmin     Role = "admin"
	RoleGymOwner  Role = "gym_owner"
	RoleTrainer   Role = "trainer"
	RoleAthlete   Role = "athlete"
)

type Claims struct {
	UserID    string `json:"userId"`
	TenantID  string `json:"tenantId"`
	Role      Role   `json:"role"`
	Panel     string `json:"panel"`
	SessionID string `json:"sessionId"`
}

