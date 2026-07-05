package auth

type Role string

const (
	RoleAdmin     Role = "admin"
	RoleGymOwner  Role = "gym_owner"
	RoleTrainer   Role = "trainer"
	RoleAthlete   Role = "athlete"
)

type Claims struct {
	UserID   string
	TenantID string
	Role     Role
	Panel    string
	SessionID string
}

