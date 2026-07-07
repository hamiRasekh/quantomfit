package dto

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type LogoutRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type CreateGymRequest struct {
	Name          string `json:"name"`
	Slug          string `json:"slug"`
	Subdomain     string `json:"subdomain"`
	PlanCode      string `json:"planCode"`
	OwnerEmail    string `json:"ownerEmail"`
	OwnerPassword string `json:"ownerPassword"`
	OwnerPhone    string `json:"ownerPhone"`
	GymType       string `json:"gymType"`
	Location      string `json:"location"`
	SizeSqm       int    `json:"sizeSqm"`
	Timezone      string `json:"timezone"`
}

type UpdateOnboardingStateRequest struct {
	Step      string         `json:"step"`
	Payload   map[string]any `json:"payload"`
	Completed bool           `json:"completed"`
}

type CreatePlanRequest struct {
	Code         string         `json:"code"`
	Name         string         `json:"name"`
	MonthlyPrice float64        `json:"monthlyPrice"`
	YearlyPrice  float64        `json:"yearlyPrice"`
	Currency     string         `json:"currency"`
	Description  string         `json:"description"`
	Limits       map[string]any `json:"limits"`
}

type UpdatePlanRequest struct {
	Name         string         `json:"name"`
	MonthlyPrice float64        `json:"monthlyPrice"`
	YearlyPrice  float64        `json:"yearlyPrice"`
	Currency     string         `json:"currency"`
	Description  string         `json:"description"`
	Limits       map[string]any `json:"limits"`
	Active       *bool          `json:"active"`
}

type CreateCouponRequest struct {
	Code               string  `json:"code"`
	DiscountType       string  `json:"discountType"`
	DiscountValue      float64 `json:"discountValue"`
	ApplicablePlanCode string  `json:"applicablePlanCode"`
	PanelType          string  `json:"panelType"`
	FirstPurchaseOnly  bool    `json:"firstPurchaseOnly"`
	UsageLimit         int     `json:"usageLimit"`
	UsagePerCustomer   int     `json:"usagePerCustomer"`
	Stackable          bool    `json:"stackable"`
	Description        string  `json:"description"`
	InternalNote       string  `json:"internalNote"`
	StartsAt           *string `json:"startsAt"`
	EndsAt             *string `json:"endsAt"`
	IsActive           *bool   `json:"isActive"`
}

type UpdateCouponRequest struct {
	DiscountType       string  `json:"discountType"`
	DiscountValue      float64 `json:"discountValue"`
	ApplicablePlanCode string  `json:"applicablePlanCode"`
	PanelType          string  `json:"panelType"`
	FirstPurchaseOnly  bool    `json:"firstPurchaseOnly"`
	UsageLimit         int     `json:"usageLimit"`
	UsagePerCustomer   int     `json:"usagePerCustomer"`
	Stackable          bool    `json:"stackable"`
	Description        string  `json:"description"`
	InternalNote       string  `json:"internalNote"`
	StartsAt           *string `json:"startsAt"`
	EndsAt             *string `json:"endsAt"`
	IsActive           *bool   `json:"isActive"`
}

type CMSContentRequest struct {
	Locale       string              `json:"locale"`
	Section      string              `json:"section"`
	Title        string              `json:"title"`
	Subtitle     string              `json:"subtitle"`
	Body         string              `json:"body"`
	CTA          string              `json:"cta"`
	Features     []string            `json:"features"`
	Faq          []map[string]string `json:"faq"`
	Testimonials []map[string]string `json:"testimonials"`
	Images       []string            `json:"images"`
	Meta         map[string]any      `json:"meta"`
}

type UpdateGymRequest struct {
	Name             string `json:"name"`
	Slug             string `json:"slug"`
	Subdomain        string `json:"subdomain"`
	PlanCode         string `json:"planCode"`
	Status           string `json:"status"`
	OnboardingStatus string `json:"onboardingStatus"`
	Timezone         string `json:"timezone"`
}

type CustomerDiscountRequest struct {
	GymID          string  `json:"gymId"`
	PlanCode       string  `json:"planCode"`
	DiscountType   string  `json:"discountType"`
	DiscountValue  float64 `json:"discountValue"`
	DurationMonths int     `json:"durationMonths"`
	StartsAt       *string `json:"startsAt"`
	EndsAt         *string `json:"endsAt"`
	Reason         string  `json:"reason"`
	Stackable      bool    `json:"stackable"`
	IsActive       *bool   `json:"isActive"`
}

type DemoAccessRequest struct {
	TenantID           string `json:"tenantId"`
	DemoType           string `json:"demoType"`
	PanelType          string `json:"panelType"`
	AccountName        string `json:"accountName"`
	Username           string `json:"username"`
	Password           string `json:"password"`
	FeatureAccessLevel string `json:"featureAccessLevel"`
	ReadOnly           bool   `json:"readOnly"`
	ExpiresAt          string `json:"expiresAt"`
	IsActive           *bool  `json:"isActive"`
	Notes              string `json:"notes"`
}

type DemoRequestRequest struct {
	RequestType string         `json:"requestType"`
	PanelType   string         `json:"panelType"`
	Name        string         `json:"name"`
	Email       string         `json:"email"`
	Phone       string         `json:"phone"`
	CompanyName string         `json:"companyName"`
	Message     string         `json:"message"`
	Status      string         `json:"status"`
	Source      string         `json:"source"`
	Metadata    map[string]any `json:"metadata"`
}

type MediaFileRequest struct {
	GymID    string         `json:"gymId"`
	Kind     string         `json:"kind"`
	URL      string         `json:"url"`
	Alt      string         `json:"alt"`
	Metadata map[string]any `json:"metadata"`
}

type PricingQuoteRequest struct {
	PlanCode     string `json:"planCode"`
	GymID        string `json:"gymId"`
	CouponCode   string `json:"couponCode"`
	BillingCycle string `json:"billingCycle"`
}

type MemberRequest struct {
	ExternalRef string `json:"externalRef"`
	FullName    string `json:"fullName"`
	Phone       string `json:"phone"`
	Gender      string `json:"gender"`
	Status      string `json:"status"`
}

type TrainerRequest struct {
	UserID    string `json:"userId"`
	FullName  string `json:"fullName"`
	Specialty string `json:"specialty"`
	Status    string `json:"status"`
}

type EquipmentRequest struct {
	Name     string `json:"name"`
	Category string `json:"category"`
	Quantity int    `json:"quantity"`
	Status   string `json:"status"`
}

type GymClassRequest struct {
	TrainerID string `json:"trainerId"`
	Title     string `json:"title"`
	Capacity  int    `json:"capacity"`
	Schedule  string `json:"schedule"`
	Status    string `json:"status"`
}

type CreateProgramRequest struct {
	Name      string `json:"name"`
	TrainerID string `json:"trainerId"`
	Status    string `json:"status"`
}

type UpdateProgramRequest struct {
	Name      string `json:"name"`
	TrainerID string `json:"trainerId"`
	Status    string `json:"status"`
}

type AssignMemberProgramRequest struct {
	ProgramID string `json:"programId"`
}

type CreateSessionRequest struct {
	Title    string `json:"title"`
	DayLabel string `json:"dayLabel"`
	MemberID string `json:"memberId"`
	Notes    string `json:"notes"`
	Status   string `json:"status"`
}

type UpdateSessionRequest struct {
	Title    string `json:"title"`
	DayLabel string `json:"dayLabel"`
	MemberID string `json:"memberId"`
	Notes    string `json:"notes"`
	Status   string `json:"status"`
}

type SMSAutomationRuleRequest struct {
	RuleName        string         `json:"ruleName"`
	TriggerType     string         `json:"triggerType"`
	Condition       map[string]any `json:"condition"`
	MessageTemplate string         `json:"messageTemplate"`
	Channel         string         `json:"channel"`
	Status          string         `json:"status"`
	LastTriggeredAt *string        `json:"lastTriggeredAt"`
	NextTriggerAt   *string        `json:"nextTriggerAt"`
}
