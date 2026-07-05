package db

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"quantomfit/backend/internal/domain/auth"
	"quantomfit/backend/internal/domain/tenant"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	pool *pgxpool.Pool
}

func NewStore(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

func (s *Store) Ping(ctx context.Context) error {
	return s.pool.Ping(ctx)
}

type PricingPlan struct {
	Code         string         `json:"code"`
	Name         string         `json:"name"`
	MonthlyPrice float64        `json:"monthlyPrice"`
	YearlyPrice  float64        `json:"yearlyPrice"`
	Currency     string         `json:"currency"`
	Description  string         `json:"description,omitempty"`
	Limits       map[string]any `json:"limits"`
	IsActive     bool           `json:"isActive"`
}

type PricingPlanUpsertInput struct {
	Code         string         `json:"code"`
	Name         string         `json:"name"`
	MonthlyPrice float64        `json:"monthlyPrice"`
	YearlyPrice  float64        `json:"yearlyPrice"`
	Currency     string         `json:"currency"`
	Description  string         `json:"description"`
	Limits       map[string]any `json:"limits"`
	Active       *bool          `json:"active"`
}

type Coupon struct {
	Code               string     `json:"code"`
	DiscountType       string     `json:"discountType"`
	DiscountValue      float64    `json:"discountValue"`
	ApplicablePlanCode string     `json:"applicablePlanCode,omitempty"`
	PanelType          string     `json:"panelType,omitempty"`
	FirstPurchaseOnly  bool       `json:"firstPurchaseOnly"`
	UsageLimit         int        `json:"usageLimit"`
	UsagePerCustomer   int        `json:"usagePerCustomer"`
	Stackable          bool       `json:"stackable"`
	Description        string     `json:"description,omitempty"`
	InternalNote       string     `json:"internalNote,omitempty"`
	IsActive           bool       `json:"isActive"`
	StartsAt           *time.Time `json:"startsAt,omitempty"`
	EndsAt             *time.Time `json:"endsAt,omitempty"`
}

type CouponUpsertInput struct {
	Code               string     `json:"code"`
	DiscountType       string     `json:"discountType"`
	DiscountValue      float64    `json:"discountValue"`
	ApplicablePlanCode string     `json:"applicablePlanCode"`
	PanelType          string     `json:"panelType"`
	FirstPurchaseOnly  bool       `json:"firstPurchaseOnly"`
	UsageLimit         int        `json:"usageLimit"`
	UsagePerCustomer   int        `json:"usagePerCustomer"`
	Stackable          bool       `json:"stackable"`
	Description        string     `json:"description"`
	InternalNote       string     `json:"internalNote"`
	StartsAt           *time.Time `json:"startsAt"`
	EndsAt             *time.Time `json:"endsAt"`
	IsActive           *bool      `json:"isActive"`
}

type OccupancySnapshot struct {
	Current    int           `json:"current"`
	Capacity   int           `json:"capacity"`
	Ratio      float64       `json:"ratio"`
	CapturedAt time.Time     `json:"capturedAt"`
	Heatmap    []HeatmapZone `json:"heatmap"`
}

type HeatmapZone struct {
	Zone  string  `json:"zone"`
	Value float64 `json:"value"`
}

type DashboardSummary struct {
	TenantID  string            `json:"tenantId"`
	GymName   string            `json:"gymName"`
	Occupancy OccupancySnapshot `json:"occupancy"`
	Members   struct {
		Total        int `json:"total"`
		Active       int `json:"active"`
		NewThisMonth int `json:"newThisMonth"`
	} `json:"members"`
	Trainers   int `json:"trainers"`
	Attendance struct {
		Today int `json:"today"`
		Week  int `json:"week"`
	} `json:"attendance"`
	Realtime struct {
		CheckinsPerMinute int `json:"checkinsPerMinute"`
		Alerts            int `json:"alerts"`
	} `json:"realtime"`
	LatestCheckins []AttendanceItem `json:"latestCheckins"`
}

type OnboardingState struct {
	Status      string         `json:"status"`
	Step        string         `json:"step"`
	CompletedAt *time.Time     `json:"completedAt,omitempty"`
	Payload     map[string]any `json:"payload"`
}

type OnboardingUpdateInput struct {
	Step      string         `json:"step"`
	Payload   map[string]any `json:"payload"`
	Completed bool           `json:"completed"`
}

type MemberItem struct {
	ID          string     `json:"id"`
	ExternalRef string     `json:"externalRef,omitempty"`
	FullName    string     `json:"fullName"`
	Phone       string     `json:"phone,omitempty"`
	Gender      string     `json:"gender,omitempty"`
	Status      string     `json:"status"`
	JoinedAt    *time.Time `json:"joinedAt,omitempty"`
}

type MemberDetail struct {
	MemberItem
	AttendanceCount int              `json:"attendanceCount"`
	LatestCheckins  []AttendanceItem `json:"latestCheckins"`
	TrainerName     string           `json:"trainerName,omitempty"`
	ProgramName     string           `json:"programName,omitempty"`
	ProgramID       string           `json:"programId,omitempty"`
}

type TrainerItem struct {
	ID        string     `json:"id"`
	FullName  string     `json:"fullName"`
	Specialty string     `json:"specialty,omitempty"`
	Status    string     `json:"status"`
	CreatedAt *time.Time `json:"createdAt,omitempty"`
}

type WorkoutProgramItem struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Status      string     `json:"status"`
	TrainerID   string     `json:"trainerId,omitempty"`
	TrainerName string     `json:"trainerName,omitempty"`
	CreatedAt   *time.Time `json:"createdAt,omitempty"`
}

type WorkoutProgramInput struct {
	Name      string `json:"name"`
	TrainerID string `json:"trainerId"`
	Status    string `json:"status"`
}

type WorkoutSessionItem struct {
	ID          string     `json:"id"`
	ProgramID   string     `json:"programId"`
	ProgramName string     `json:"programName,omitempty"`
	MemberID    string     `json:"memberId,omitempty"`
	Title       string     `json:"title"`
	DayLabel    string     `json:"dayLabel"`
	Status      string     `json:"status"`
	Notes       string     `json:"notes,omitempty"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`
	CreatedAt   *time.Time `json:"createdAt,omitempty"`
}

type WorkoutSessionInput struct {
	Title    string `json:"title"`
	DayLabel string `json:"dayLabel"`
	MemberID string `json:"memberId"`
	Notes    string `json:"notes"`
	Status   string `json:"status"`
}

type EquipmentItem struct {
	ID                string     `json:"id"`
	Name              string     `json:"name"`
	Category          string     `json:"category,omitempty"`
	Quantity          int        `json:"quantity"`
	Status            string     `json:"status"`
	LastMaintenanceAt *time.Time `json:"lastMaintenanceAt,omitempty"`
}

type AttendanceItem struct {
	ID         string     `json:"id"`
	MemberID   string     `json:"memberId"`
	MemberName string     `json:"memberName"`
	CheckinAt  time.Time  `json:"checkinAt"`
	CheckoutAt *time.Time `json:"checkoutAt,omitempty"`
	Source     string     `json:"source"`
}

type SMSAutomationRuleItem struct {
	ID               string         `json:"id"`
	RuleName         string         `json:"ruleName"`
	TriggerType      string         `json:"triggerType"`
	Condition        map[string]any `json:"condition"`
	MessageTemplate  string         `json:"messageTemplate"`
	Channel          string         `json:"channel"`
	Status           string         `json:"status"`
	LastTriggeredAt  *time.Time     `json:"lastTriggeredAt,omitempty"`
	NextTriggerAt    *time.Time     `json:"nextTriggerAt,omitempty"`
	CreatedAt        *time.Time     `json:"createdAt,omitempty"`
	UpdatedAt        *time.Time     `json:"updatedAt,omitempty"`
}

type SMSAutomationRuleInput struct {
	RuleName        string         `json:"ruleName"`
	TriggerType     string         `json:"triggerType"`
	Condition       map[string]any `json:"condition"`
	MessageTemplate string         `json:"messageTemplate"`
	Channel         string         `json:"channel"`
	Status          string         `json:"status"`
	LastTriggeredAt  *time.Time     `json:"lastTriggeredAt,omitempty"`
	NextTriggerAt    *time.Time     `json:"nextTriggerAt,omitempty"`
}

type SMSAutomationLogItem struct {
	ID         string         `json:"id"`
	Channel    string         `json:"channel"`
	Status     string         `json:"status"`
	Message    string         `json:"message"`
	Metadata   map[string]any `json:"metadata"`
	SentAt     *time.Time     `json:"sentAt,omitempty"`
	CreatedAt  *time.Time     `json:"createdAt,omitempty"`
}

type GymRecord struct {
	ID                 string    `json:"id"`
	Slug               string    `json:"slug"`
	Name               string    `json:"name"`
	Status             string    `json:"status"`
	PlanCode           string    `json:"planCode"`
	PlanName           string    `json:"planName"`
	Subdomain          string    `json:"subdomain"`
	TenantType         string    `json:"tenantType"`
	Timezone           string    `json:"timezone"`
	OnboardingStatus   string    `json:"onboardingStatus"`
	MemberCount        int       `json:"memberCount"`
	TrainerCount       int       `json:"trainerCount"`
	ActiveMemberships  int       `json:"activeMemberships"`
	LatestOccupancy    int       `json:"latestOccupancy"`
	Capacity           int       `json:"capacity"`
	SubscriptionStatus string    `json:"subscriptionStatus"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

type PlatformSummary struct {
	ServiceName           string        `json:"serviceName"`
	Version               string        `json:"version"`
	Env                   string        `json:"env"`
	BuiltAt               time.Time     `json:"builtAt"`
	StartedAt             time.Time     `json:"startedAt"`
	GymCount              int           `json:"gymCount"`
	ActiveGyms            int           `json:"activeGyms"`
	PendingOnboardingGyms int           `json:"pendingOnboardingGyms"`
	TotalUsers            int           `json:"totalUsers"`
	TrainerCount          int           `json:"trainerCount"`
	AthleteCount          int           `json:"athleteCount"`
	ActiveDemoAccounts    int           `json:"activeDemoAccounts"`
	MonthlyRevenue        float64       `json:"monthlyRevenue"`
	Plans                 []PricingPlan `json:"plans"`
	Coupons               []Coupon      `json:"coupons"`
	LatestGyms            []GymRecord   `json:"latestGyms"`
}

type AdminUserRecord struct {
	ID          string     `json:"id"`
	Email       string     `json:"email"`
	Phone       string     `json:"phone,omitempty"`
	Role        string     `json:"role"`
	Status      string     `json:"status"`
	GymName     string     `json:"gymName,omitempty"`
	GymSlug     string     `json:"gymSlug,omitempty"`
	LastLoginAt *time.Time `json:"lastLoginAt,omitempty"`
}

type WebsiteContentRecord struct {
	Locale       string              `json:"locale"`
	Section      string              `json:"section"`
	Title        string              `json:"title"`
	Subtitle     string              `json:"subtitle"`
	Body         string              `json:"body"`
	CTA          string              `json:"cta"`
	Features     []string            `json:"features"`
	FAQ          []map[string]string `json:"faq"`
	Testimonials []map[string]string `json:"testimonials"`
	Images       []string            `json:"images"`
	Meta         map[string]any      `json:"meta"`
	UpdatedAt    time.Time           `json:"updatedAt"`
}

type GymCreateInput struct {
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

type CreatedGym struct {
	Gym     GymRecord `json:"gym"`
	OwnerID string    `json:"ownerId"`
}

var ErrNoRows = errors.New("no rows")

func (s *Store) PlatformSummary(ctx context.Context, serviceName, version, env string, builtAt, startedAt time.Time) (PlatformSummary, error) {
	plans, err := s.ListPricingPlans(ctx)
	if err != nil {
		return PlatformSummary{}, err
	}
	coupons, err := s.ListCoupons(ctx)
	if err != nil {
		return PlatformSummary{}, err
	}
	gyms, err := s.ListGyms(ctx)
	if err != nil {
		return PlatformSummary{}, err
	}
	var counts struct {
		totalUsers         int
		trainers           int
		athletes           int
		activeDemoAccounts int
		pendingOnboarding  int
		monthlyRevenue     float64
	}
	if err := s.pool.QueryRow(ctx, `SELECT COUNT(*)::int FROM users`).Scan(&counts.totalUsers); err != nil {
		return PlatformSummary{}, err
	}
	if err := s.pool.QueryRow(ctx, `SELECT COUNT(*)::int FROM trainers WHERE status = 'active'`).Scan(&counts.trainers); err != nil {
		return PlatformSummary{}, err
	}
	if err := s.pool.QueryRow(ctx, `SELECT COUNT(*)::int FROM gym_users WHERE role = 'athlete' AND status = 'active'`).Scan(&counts.athletes); err != nil {
		return PlatformSummary{}, err
	}
	if err := s.pool.QueryRow(ctx, `SELECT COUNT(*)::int FROM demo_accesses WHERE is_active = true AND expires_at > now()`).Scan(&counts.activeDemoAccounts); err != nil {
		return PlatformSummary{}, err
	}
	if err := s.pool.QueryRow(ctx, `SELECT COUNT(*)::int FROM gyms WHERE onboarding_status <> 'active'`).Scan(&counts.pendingOnboarding); err != nil {
		return PlatformSummary{}, err
	}
	if err := s.pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(COALESCE(p.monthly_price, 0)), 0)::float8
		FROM subscriptions s
		LEFT JOIN pricing_plans p ON p.id = s.plan_id
		WHERE s.status = 'active'`).Scan(&counts.monthlyRevenue); err != nil {
		return PlatformSummary{}, err
	}

	active := 0
	for _, g := range gyms {
		if strings.EqualFold(g.Status, "active") {
			active++
		}
	}

	return PlatformSummary{
		ServiceName:           serviceName,
		Version:               version,
		Env:                   env,
		BuiltAt:               builtAt.UTC(),
		StartedAt:             startedAt.UTC(),
		GymCount:              len(gyms),
		ActiveGyms:            active,
		PendingOnboardingGyms: counts.pendingOnboarding,
		TotalUsers:            counts.totalUsers,
		TrainerCount:          counts.trainers,
		AthleteCount:          counts.athletes,
		ActiveDemoAccounts:    counts.activeDemoAccounts,
		MonthlyRevenue:        counts.monthlyRevenue,
		Plans:                 plans,
		Coupons:               coupons,
		LatestGyms:            gyms,
	}, nil
}

func (s *Store) ListPricingPlans(ctx context.Context) ([]PricingPlan, error) {
	rows, err := s.pool.Query(ctx, `SELECT code, name, COALESCE(monthly_price, 0), COALESCE(yearly_price, 0), COALESCE(currency, 'USD'), COALESCE(description, ''), limits, is_active FROM pricing_plans WHERE is_active = true ORDER BY code`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]PricingPlan, 0)
	for rows.Next() {
		var plan PricingPlan
		var limitsJSON []byte
		if err := rows.Scan(&plan.Code, &plan.Name, &plan.MonthlyPrice, &plan.YearlyPrice, &plan.Currency, &plan.Description, &limitsJSON, &plan.IsActive); err != nil {
			return nil, err
		}
		plan.Limits = map[string]any{}
		if len(limitsJSON) > 0 {
			if err := json.Unmarshal(limitsJSON, &plan.Limits); err != nil {
				return nil, err
			}
		}
		out = append(out, plan)
	}
	return out, rows.Err()
}

func (s *Store) ListCoupons(ctx context.Context) ([]Coupon, error) {
	rows, err := s.pool.Query(ctx, `SELECT code, discount_type, discount_value, COALESCE(applicable_plan_code, ''), COALESCE(panel_type, ''), first_purchase_only, usage_limit, usage_per_customer, stackable, COALESCE(description, ''), COALESCE(internal_note, ''), is_active, starts_at, ends_at FROM coupons WHERE is_active = true ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]Coupon, 0)
	for rows.Next() {
		var coupon Coupon
		var startsAt, endsAt sql.NullTime
		if err := rows.Scan(&coupon.Code, &coupon.DiscountType, &coupon.DiscountValue, &coupon.ApplicablePlanCode, &coupon.PanelType, &coupon.FirstPurchaseOnly, &coupon.UsageLimit, &coupon.UsagePerCustomer, &coupon.Stackable, &coupon.Description, &coupon.InternalNote, &coupon.IsActive, &startsAt, &endsAt); err != nil {
			return nil, err
		}
		if startsAt.Valid {
			value := startsAt.Time.UTC()
			coupon.StartsAt = &value
		}
		if endsAt.Valid {
			value := endsAt.Time.UTC()
			coupon.EndsAt = &value
		}
		out = append(out, coupon)
	}
	return out, rows.Err()
}

func (s *Store) ListUsers(ctx context.Context) ([]AdminUserRecord, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT
			u.id::text,
			u.email,
			COALESCE(u.phone, ''),
			COALESCE(gu.role, 'admin'),
			u.status,
			COALESCE(g.name, ''),
			COALESCE(g.slug, ''),
			u.last_login_at
		FROM users u
		LEFT JOIN gym_users gu ON gu.user_id = u.id
		LEFT JOIN gyms g ON g.id = gu.tenant_id
		ORDER BY u.created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]AdminUserRecord, 0)
	for rows.Next() {
		var item AdminUserRecord
		var lastLogin sql.NullTime
		if err := rows.Scan(&item.ID, &item.Email, &item.Phone, &item.Role, &item.Status, &item.GymName, &item.GymSlug, &lastLogin); err != nil {
			return nil, err
		}
		if lastLogin.Valid {
			value := lastLogin.Time.UTC()
			item.LastLoginAt = &value
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) WebsiteContent(ctx context.Context) ([]WebsiteContentRecord, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT locale, section, title, subtitle, body, cta, features, faq, testimonials, images, meta, updated_at
		FROM website_content
		ORDER BY updated_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]WebsiteContentRecord, 0)
	for rows.Next() {
		var item WebsiteContentRecord
		var featuresJSON, faqJSON, testimonialsJSON, imagesJSON, metaJSON []byte
		if err := rows.Scan(&item.Locale, &item.Section, &item.Title, &item.Subtitle, &item.Body, &item.CTA, &featuresJSON, &faqJSON, &testimonialsJSON, &imagesJSON, &metaJSON, &item.UpdatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(featuresJSON, &item.Features)
		_ = json.Unmarshal(faqJSON, &item.FAQ)
		_ = json.Unmarshal(testimonialsJSON, &item.Testimonials)
		_ = json.Unmarshal(imagesJSON, &item.Images)
		item.Meta = map[string]any{}
		_ = json.Unmarshal(metaJSON, &item.Meta)
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) UpsertWebsiteContent(ctx context.Context, input WebsiteContentRecord) (WebsiteContentRecord, error) {
	featuresJSON, err := json.Marshal(input.Features)
	if err != nil {
		return WebsiteContentRecord{}, err
	}
	faqJSON, err := json.Marshal(input.FAQ)
	if err != nil {
		return WebsiteContentRecord{}, err
	}
	testimonialsJSON, err := json.Marshal(input.Testimonials)
	if err != nil {
		return WebsiteContentRecord{}, err
	}
	imagesJSON, err := json.Marshal(input.Images)
	if err != nil {
		return WebsiteContentRecord{}, err
	}
	metaJSON, err := json.Marshal(input.Meta)
	if err != nil {
		return WebsiteContentRecord{}, err
	}

	if input.Locale == "" {
		input.Locale = "en"
	}
	if input.Section == "" {
		input.Section = "homepage"
	}

	if _, err := s.pool.Exec(ctx, `
		INSERT INTO website_content (locale, section, title, subtitle, body, cta, features, faq, testimonials, images, meta, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, now())
		ON CONFLICT (locale, section) DO UPDATE SET
			title = EXCLUDED.title,
			subtitle = EXCLUDED.subtitle,
			body = EXCLUDED.body,
			cta = EXCLUDED.cta,
			features = EXCLUDED.features,
			faq = EXCLUDED.faq,
			testimonials = EXCLUDED.testimonials,
			images = EXCLUDED.images,
			meta = EXCLUDED.meta,
			updated_at = now()`,
		input.Locale, input.Section, input.Title, input.Subtitle, input.Body, input.CTA, string(featuresJSON), string(faqJSON), string(testimonialsJSON), string(imagesJSON), string(metaJSON)); err != nil {
		return WebsiteContentRecord{}, err
	}

	return input, nil
}

func (s *Store) UpsertPricingPlan(ctx context.Context, input PricingPlanUpsertInput) (PricingPlan, error) {
	if input.Code == "" || input.Name == "" {
		return PricingPlan{}, errors.New("code and name are required")
	}
	limitsJSON, err := json.Marshal(input.Limits)
	if err != nil {
		return PricingPlan{}, err
	}
	active := true
	if input.Active != nil {
		active = *input.Active
	}
	if _, err := s.pool.Exec(ctx, `
		INSERT INTO pricing_plans (code, name, monthly_price, yearly_price, currency, description, limits, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
		ON CONFLICT (code) DO UPDATE SET
			name = EXCLUDED.name,
			monthly_price = EXCLUDED.monthly_price,
			yearly_price = EXCLUDED.yearly_price,
			currency = EXCLUDED.currency,
			description = EXCLUDED.description,
			limits = EXCLUDED.limits,
			is_active = EXCLUDED.is_active`,
		input.Code, input.Name, input.MonthlyPrice, input.YearlyPrice, input.Currency, input.Description, string(limitsJSON), active); err != nil {
		return PricingPlan{}, err
	}
	currency := strings.TrimSpace(input.Currency)
	if currency == "" {
		currency = "USD"
	}
	return PricingPlan{Code: input.Code, Name: input.Name, MonthlyPrice: input.MonthlyPrice, YearlyPrice: input.YearlyPrice, Currency: currency, Description: input.Description, Limits: input.Limits, IsActive: active}, nil
}

func (s *Store) UpsertCoupon(ctx context.Context, input CouponUpsertInput) (Coupon, error) {
	if input.Code == "" {
		return Coupon{}, errors.New("coupon code is required")
	}
	active := true
	if input.IsActive != nil {
		active = *input.IsActive
	}
	if _, err := s.pool.Exec(ctx, `
		INSERT INTO coupons (code, discount_type, discount_value, applicable_plan_code, panel_type, first_purchase_only, usage_limit, usage_per_customer, stackable, description, internal_note, starts_at, ends_at, is_active)
		VALUES ($1, $2, $3, NULLIF($4, ''), NULLIF($5, ''), $6, NULLIF($7, 0), NULLIF($8, 0), $9, $10, $11, $12, $13, $14)
		ON CONFLICT (code) DO UPDATE SET
			discount_type = EXCLUDED.discount_type,
			discount_value = EXCLUDED.discount_value,
			applicable_plan_code = EXCLUDED.applicable_plan_code,
			panel_type = EXCLUDED.panel_type,
			first_purchase_only = EXCLUDED.first_purchase_only,
			usage_limit = EXCLUDED.usage_limit,
			usage_per_customer = EXCLUDED.usage_per_customer,
			stackable = EXCLUDED.stackable,
			description = EXCLUDED.description,
			internal_note = EXCLUDED.internal_note,
			starts_at = EXCLUDED.starts_at,
			ends_at = EXCLUDED.ends_at,
			is_active = EXCLUDED.is_active`,
		input.Code, input.DiscountType, input.DiscountValue, input.ApplicablePlanCode, input.PanelType, input.FirstPurchaseOnly, input.UsageLimit, input.UsagePerCustomer, input.Stackable, input.Description, input.InternalNote, input.StartsAt, input.EndsAt, active); err != nil {
		return Coupon{}, err
	}
	return Coupon{
		Code:               input.Code,
		DiscountType:       input.DiscountType,
		DiscountValue:      input.DiscountValue,
		ApplicablePlanCode: input.ApplicablePlanCode,
		PanelType:          input.PanelType,
		FirstPurchaseOnly:  input.FirstPurchaseOnly,
		UsageLimit:         input.UsageLimit,
		UsagePerCustomer:   input.UsagePerCustomer,
		Stackable:          input.Stackable,
		Description:        input.Description,
		InternalNote:       input.InternalNote,
		IsActive:           active,
		StartsAt:           input.StartsAt,
		EndsAt:             input.EndsAt,
	}, nil
}

func (s *Store) SetGymStatus(ctx context.Context, gymID, status, onboardingStatus string) (GymRecord, error) {
	if _, err := s.pool.Exec(ctx, `
		UPDATE gyms
		SET status = COALESCE(NULLIF($2, ''), status),
		    onboarding_status = COALESCE(NULLIF($3, ''), onboarding_status),
		    updated_at = now()
		WHERE id = $1::uuid`, gymID, status, onboardingStatus); err != nil {
		return GymRecord{}, err
	}
	return s.GetGymByTenantID(ctx, gymID)
}

func (s *Store) UpdateGymMetadata(ctx context.Context, gymID, name, slug, subdomain, planCode, status, onboardingStatus, timezone string) (GymRecord, error) {
	if _, err := s.pool.Exec(ctx, `
		UPDATE gyms
		SET name = COALESCE(NULLIF($2, ''), name),
		    slug = COALESCE(NULLIF($3, ''), slug),
		    plan_code = COALESCE(NULLIF($5, ''), plan_code),
		    status = COALESCE(NULLIF($6, ''), status),
		    onboarding_status = COALESCE(NULLIF($7, ''), onboarding_status),
		    timezone = COALESCE(NULLIF($8, ''), timezone),
		    updated_at = now()
		WHERE id = $1::uuid`, gymID, name, slug, subdomain, planCode, status, onboardingStatus, timezone); err != nil {
		return GymRecord{}, err
	}
	if subdomain != "" {
		if _, err := s.pool.Exec(ctx, `
			UPDATE tenant_domains
			SET subdomain = $2, updated_at = now()
			WHERE tenant_id = $1::uuid`, gymID, subdomain); err != nil {
			return GymRecord{}, err
		}
	}
	return s.GetGymByTenantID(ctx, gymID)
}

func (s *Store) SetPricingPlanActive(ctx context.Context, code string, active bool) error {
	_, err := s.pool.Exec(ctx, `UPDATE pricing_plans SET is_active = $2 WHERE code = $1`, code, active)
	return err
}

func (s *Store) SetCouponActive(ctx context.Context, code string, active bool) error {
	_, err := s.pool.Exec(ctx, `UPDATE coupons SET is_active = $2 WHERE code = $1`, code, active)
	return err
}

func (s *Store) ListGyms(ctx context.Context) ([]GymRecord, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT
			g.id::text,
			g.slug,
			g.name,
			g.status,
			g.plan_code,
			COALESCE(p.name, g.plan_code) AS plan_name,
			g.subdomain,
			g.tenant_type,
			g.timezone,
			g.onboarding_status,
			COALESCE(member_counts.member_count, 0) AS member_count,
			COALESCE(trainer_counts.trainer_count, 0) AS trainer_count,
			COALESCE(member_counts.member_count, 0) AS active_memberships,
			COALESCE(occupancy.current_occupancy, 0) AS latest_occupancy,
			COALESCE(occupancy.capacity, 0) AS capacity,
			COALESCE(subscription.status, 'inactive') AS subscription_status,
			g.created_at,
			g.updated_at
		FROM gyms g
		LEFT JOIN pricing_plans p ON p.code = g.plan_code
		LEFT JOIN LATERAL (
			SELECT COUNT(*)::int AS member_count
			FROM members m
			WHERE m.tenant_id = g.id
		) member_counts ON true
		LEFT JOIN LATERAL (
			SELECT COUNT(*)::int AS trainer_count
			FROM trainers t
			WHERE t.tenant_id = g.id
		) trainer_counts ON true
		LEFT JOIN LATERAL (
			SELECT current_occupancy, capacity
			FROM occupancy_snapshots o
			WHERE o.tenant_id = g.id
			ORDER BY o.captured_at DESC
			LIMIT 1
		) occupancy ON true
		LEFT JOIN LATERAL (
			SELECT status
			FROM subscriptions s
			WHERE s.tenant_id = g.id
			ORDER BY s.created_at DESC
			LIMIT 1
		) subscription ON true
		ORDER BY g.created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]GymRecord, 0)
	for rows.Next() {
		var item GymRecord
		if err := rows.Scan(
			&item.ID,
			&item.Slug,
			&item.Name,
			&item.Status,
			&item.PlanCode,
			&item.PlanName,
			&item.Subdomain,
			&item.TenantType,
			&item.Timezone,
			&item.OnboardingStatus,
			&item.MemberCount,
			&item.TrainerCount,
			&item.ActiveMemberships,
			&item.LatestOccupancy,
			&item.Capacity,
			&item.SubscriptionStatus,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) GetGymByTenantID(ctx context.Context, tenantID string) (GymRecord, error) {
	var item GymRecord
	err := s.pool.QueryRow(ctx, `
		SELECT
			g.id::text,
			g.slug,
			g.name,
			g.status,
			g.plan_code,
			COALESCE(p.name, g.plan_code) AS plan_name,
			g.subdomain,
			g.tenant_type,
			g.timezone,
			g.onboarding_status,
			COALESCE(member_counts.member_count, 0) AS member_count,
			COALESCE(trainer_counts.trainer_count, 0) AS trainer_count,
			COALESCE(member_counts.member_count, 0) AS active_memberships,
			COALESCE(occupancy.current_occupancy, 0) AS latest_occupancy,
			COALESCE(occupancy.capacity, 0) AS capacity,
			COALESCE(subscription.status, 'inactive') AS subscription_status,
			g.created_at,
			g.updated_at
		FROM gyms g
		LEFT JOIN pricing_plans p ON p.code = g.plan_code
		LEFT JOIN LATERAL (
			SELECT COUNT(*)::int AS member_count
			FROM members m
			WHERE m.tenant_id = g.id
		) member_counts ON true
		LEFT JOIN LATERAL (
			SELECT COUNT(*)::int AS trainer_count
			FROM trainers t
			WHERE t.tenant_id = g.id
		) trainer_counts ON true
		LEFT JOIN LATERAL (
			SELECT current_occupancy, capacity
			FROM occupancy_snapshots o
			WHERE o.tenant_id = g.id
			ORDER BY o.captured_at DESC
			LIMIT 1
		) occupancy ON true
		LEFT JOIN LATERAL (
			SELECT status
			FROM subscriptions s
			WHERE s.tenant_id = g.id
			ORDER BY s.created_at DESC
			LIMIT 1
		) subscription ON true
		WHERE g.id = $1::uuid`, tenantID).Scan(
		&item.ID,
		&item.Slug,
		&item.Name,
		&item.Status,
		&item.PlanCode,
		&item.PlanName,
		&item.Subdomain,
		&item.TenantType,
		&item.Timezone,
		&item.OnboardingStatus,
		&item.MemberCount,
		&item.TrainerCount,
		&item.ActiveMemberships,
		&item.LatestOccupancy,
		&item.Capacity,
		&item.SubscriptionStatus,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return GymRecord{}, ErrNoRows
		}
		return GymRecord{}, err
	}
	return item, nil
}

func (s *Store) GetTenantBySubdomain(ctx context.Context, subdomain string) (tenant.Tenant, error) {
	var item tenant.Tenant
	err := s.pool.QueryRow(ctx, `
		SELECT g.id::text, g.slug, g.name, td.subdomain, td.panel_type, g.status, g.created_at, g.updated_at
		FROM tenant_domains td
		JOIN gyms g ON g.id = td.tenant_id
		WHERE td.subdomain = $1 AND td.is_active = true
		ORDER BY td.created_at DESC
		LIMIT 1`, subdomain).Scan(&item.ID, &item.Slug, &item.Name, &item.Subdomain, &item.PanelType, &item.Status, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return tenant.Tenant{}, ErrNoRows
		}
		return tenant.Tenant{}, err
	}
	return item, nil
}

func (s *Store) withTenantTx(ctx context.Context, tenantID string, fn func(tx pgx.Tx) error) error {
	tx, err := s.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `SELECT set_config('app.tenant_id', $1, true)`, tenantID); err != nil {
		return err
	}
	if err := fn(tx); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (s *Store) DashboardSummary(ctx context.Context, tenantID string) (DashboardSummary, error) {
	var summary DashboardSummary
	summary.TenantID = tenantID

	err := s.withTenantTx(ctx, tenantID, func(tx pgx.Tx) error {
		var gymName string
		if err := tx.QueryRow(ctx, `SELECT name FROM gyms WHERE id = $1::uuid`, tenantID).Scan(&gymName); err != nil {
			return err
		}
		summary.GymName = gymName

		if err := tx.QueryRow(ctx, `
			SELECT COUNT(*)::int,
			       COUNT(*) FILTER (WHERE status = 'active')::int,
			       COUNT(*) FILTER (WHERE joined_at >= date_trunc('month', now()))::int
			FROM members
			WHERE tenant_id = $1::uuid`, tenantID).Scan(&summary.Members.Total, &summary.Members.Active, &summary.Members.NewThisMonth); err != nil {
			return err
		}

		if err := tx.QueryRow(ctx, `SELECT COUNT(*)::int FROM trainers WHERE tenant_id = $1::uuid AND status = 'active'`, tenantID).Scan(&summary.Trainers); err != nil {
			return err
		}

		if err := tx.QueryRow(ctx, `
			SELECT
				COALESCE((SELECT current_occupancy FROM occupancy_snapshots WHERE tenant_id = $1::uuid ORDER BY captured_at DESC LIMIT 1), 0)::int,
				COALESCE((SELECT capacity FROM occupancy_snapshots WHERE tenant_id = $1::uuid ORDER BY captured_at DESC LIMIT 1), 0)::int,
				COALESCE((SELECT captured_at FROM occupancy_snapshots WHERE tenant_id = $1::uuid ORDER BY captured_at DESC LIMIT 1), now())
		`, tenantID).Scan(&summary.Occupancy.Current, &summary.Occupancy.Capacity, &summary.Occupancy.CapturedAt); err != nil {
			return err
		}
		if summary.Occupancy.Capacity > 0 {
			summary.Occupancy.Ratio = float64(summary.Occupancy.Current) / float64(summary.Occupancy.Capacity)
		}
		summary.Occupancy.Heatmap = []HeatmapZone{
			{Zone: "weights", Value: 0.72},
			{Zone: "cardio", Value: 0.43},
			{Zone: "studio", Value: 0.91},
		}

		if err := tx.QueryRow(ctx, `SELECT COUNT(*)::int FROM attendance_logs WHERE tenant_id = $1::uuid AND checkin_at >= date_trunc('day', now())`, tenantID).Scan(&summary.Attendance.Today); err != nil {
			return err
		}
		if err := tx.QueryRow(ctx, `SELECT COUNT(*)::int FROM attendance_logs WHERE tenant_id = $1::uuid AND checkin_at >= now() - interval '7 days'`, tenantID).Scan(&summary.Attendance.Week); err != nil {
			return err
		}
		if err := tx.QueryRow(ctx, `SELECT COUNT(*)::int FROM attendance_logs WHERE tenant_id = $1::uuid AND checkin_at >= now() - interval '1 minute'`, tenantID).Scan(&summary.Realtime.CheckinsPerMinute); err != nil {
			return err
		}
		if err := tx.QueryRow(ctx, `
			SELECT COUNT(*)::int
			FROM equipment
			WHERE tenant_id = $1::uuid AND status = 'maintenance'`, tenantID).Scan(&summary.Realtime.Alerts); err != nil {
			return err
		}

		rows, err := tx.Query(ctx, `
			SELECT
				a.id::text,
				a.member_id::text,
				COALESCE(m.full_name, 'Unknown Member') AS member_name,
				a.checkin_at,
				a.checkout_at,
				a.source
			FROM attendance_logs a
			LEFT JOIN members m ON m.id = a.member_id AND m.tenant_id = a.tenant_id
			WHERE a.tenant_id = $1::uuid
			ORDER BY a.checkin_at DESC
			LIMIT 6`, tenantID)
		if err != nil {
			return err
		}
		defer rows.Close()

		for rows.Next() {
			var item AttendanceItem
			var checkout sql.NullTime
			if err := rows.Scan(&item.ID, &item.MemberID, &item.MemberName, &item.CheckinAt, &checkout, &item.Source); err != nil {
				return err
			}
			if checkout.Valid {
				value := checkout.Time.UTC()
				item.CheckoutAt = &value
			}
			summary.LatestCheckins = append(summary.LatestCheckins, item)
		}
		return rows.Err()
	})
	if err != nil {
		return DashboardSummary{}, err
	}

	return summary, nil
}

func (s *Store) OnboardingState(ctx context.Context, tenantID string) (OnboardingState, error) {
	var payloadJSON []byte
	var completedAt sql.NullTime
	var state OnboardingState

	err := s.withTenantTx(ctx, tenantID, func(tx pgx.Tx) error {
		return tx.QueryRow(ctx, `
			SELECT step, payload, completed_at
			FROM onboarding_state
			WHERE tenant_id = $1::uuid
			LIMIT 1`, tenantID).Scan(&state.Step, &payloadJSON, &completedAt)
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return OnboardingState{Status: "created", Step: "gym_name", Payload: map[string]any{}}, nil
		}
		return OnboardingState{}, err
	}

	state.Status = "in_progress"
	if completedAt.Valid {
		value := completedAt.Time.UTC()
		state.CompletedAt = &value
		state.Status = "active"
	}
	state.Payload = map[string]any{}
	if len(payloadJSON) > 0 {
		if err := json.Unmarshal(payloadJSON, &state.Payload); err != nil {
			return OnboardingState{}, err
		}
	}
	return state, nil
}

func (s *Store) UpdateOnboardingState(ctx context.Context, tenantID string, input OnboardingUpdateInput) (OnboardingState, error) {
	input.Step = strings.TrimSpace(input.Step)
	if input.Step == "" {
		input.Step = "gym_name"
	}
	if input.Payload == nil {
		input.Payload = map[string]any{}
	}

	payloadJSON, err := json.Marshal(input.Payload)
	if err != nil {
		return OnboardingState{}, err
	}

	var state OnboardingState
	var completedAt sql.NullTime

	err = s.withTenantTx(ctx, tenantID, func(tx pgx.Tx) error {
		if input.Completed {
			if _, err := tx.Exec(ctx, `
				UPDATE gyms
				SET onboarding_status = 'active', updated_at = now()
				WHERE id = $1::uuid`, tenantID); err != nil {
				return err
			}
		}

		if _, err := tx.Exec(ctx, `
			INSERT INTO onboarding_state (tenant_id, step, payload, completed_at, updated_at)
			VALUES ($1::uuid, $2, $3::jsonb, CASE WHEN $4 THEN now() ELSE NULL END, now())
			ON CONFLICT (tenant_id) DO UPDATE SET
				step = EXCLUDED.step,
				payload = EXCLUDED.payload,
				completed_at = EXCLUDED.completed_at,
				updated_at = now()`,
			tenantID, input.Step, string(payloadJSON), input.Completed); err != nil {
			return err
		}

		return tx.QueryRow(ctx, `
			SELECT step, payload, completed_at
			FROM onboarding_state
			WHERE tenant_id = $1::uuid
			LIMIT 1`, tenantID).Scan(&state.Step, &payloadJSON, &completedAt)
	})
	if err != nil {
		return OnboardingState{}, err
	}

	state.Status = "in_progress"
	if completedAt.Valid {
		value := completedAt.Time.UTC()
		state.CompletedAt = &value
		state.Status = "active"
	}
	state.Payload = map[string]any{}
	if len(payloadJSON) > 0 {
		if err := json.Unmarshal(payloadJSON, &state.Payload); err != nil {
			return OnboardingState{}, err
		}
	}
	return state, nil
}

func (s *Store) ListMembers(ctx context.Context, tenantID string, limit int) ([]MemberItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 24
	}
	rows, err := s.pool.Query(ctx, `
		SELECT id::text, COALESCE(external_ref, ''), full_name, COALESCE(phone, ''), COALESCE(gender, ''), status, joined_at
		FROM members
		WHERE tenant_id = $1::uuid
		ORDER BY created_at DESC
		LIMIT $2`, tenantID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]MemberItem, 0)
	for rows.Next() {
		var item MemberItem
		var joinedAt sql.NullTime
		if err := rows.Scan(&item.ID, &item.ExternalRef, &item.FullName, &item.Phone, &item.Gender, &item.Status, &joinedAt); err != nil {
			return nil, err
		}
		if joinedAt.Valid {
			value := joinedAt.Time.UTC()
			item.JoinedAt = &value
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) GetMemberByID(ctx context.Context, tenantID, memberID string) (MemberDetail, error) {
	var detail MemberDetail
	var joinedAt sql.NullTime
	err := s.withTenantTx(ctx, tenantID, func(tx pgx.Tx) error {
		if err := tx.QueryRow(ctx, `
			SELECT id::text, COALESCE(external_ref, ''), full_name, COALESCE(phone, ''), COALESCE(gender, ''), status, joined_at
			FROM members
			WHERE tenant_id = $1::uuid AND id = $2::uuid
			LIMIT 1`, tenantID, memberID).Scan(
			&detail.ID,
			&detail.ExternalRef,
			&detail.FullName,
			&detail.Phone,
			&detail.Gender,
			&detail.Status,
			&joinedAt,
		); err != nil {
			return err
		}
		if joinedAt.Valid {
			value := joinedAt.Time.UTC()
			detail.JoinedAt = &value
		}

		if err := tx.QueryRow(ctx, `
			SELECT COUNT(*)::int
			FROM attendance_logs
			WHERE tenant_id = $1::uuid AND member_id = $2::uuid`, tenantID, memberID).Scan(&detail.AttendanceCount); err != nil {
			return err
		}

		if err := tx.QueryRow(ctx, `
			SELECT COALESCE(wpm.program_id::text, ''), COALESCE(wp.name, '')
			FROM workout_program_members wpm
			LEFT JOIN workout_programs wp ON wp.id = wpm.program_id AND wp.tenant_id = wpm.tenant_id
			WHERE wpm.tenant_id = $1::uuid AND wpm.member_id = $2::uuid
			LIMIT 1`, tenantID, memberID).Scan(&detail.ProgramID, &detail.ProgramName); err != nil && !errors.Is(err, pgx.ErrNoRows) {
			return err
		}

		rows, err := tx.Query(ctx, `
			SELECT
				a.id::text,
				a.member_id::text,
				COALESCE(m.full_name, 'Unknown Member') AS member_name,
				a.checkin_at,
				a.checkout_at,
				a.source
			FROM attendance_logs a
			LEFT JOIN members m ON m.id = a.member_id AND m.tenant_id = a.tenant_id
			WHERE a.tenant_id = $1::uuid AND a.member_id = $2::uuid
			ORDER BY a.checkin_at DESC
			LIMIT 5`, tenantID, memberID)
		if err != nil {
			return err
		}
		defer rows.Close()

		for rows.Next() {
			var item AttendanceItem
			var checkout sql.NullTime
			if err := rows.Scan(&item.ID, &item.MemberID, &item.MemberName, &item.CheckinAt, &checkout, &item.Source); err != nil {
				return err
			}
			if checkout.Valid {
				value := checkout.Time.UTC()
				item.CheckoutAt = &value
			}
			detail.LatestCheckins = append(detail.LatestCheckins, item)
		}
		return rows.Err()
	})
	if err != nil {
		return MemberDetail{}, err
	}
	return detail, nil
}

func (s *Store) AssignMemberProgram(ctx context.Context, tenantID, memberID, programID string) (MemberDetail, error) {
	if _, err := s.pool.Exec(ctx, `
		INSERT INTO workout_program_members (tenant_id, member_id, program_id, assigned_at)
		VALUES ($1::uuid, $2::uuid, $3::uuid, now())
		ON CONFLICT (tenant_id, member_id) DO UPDATE SET
			program_id = EXCLUDED.program_id,
			assigned_at = now()`,
		tenantID, memberID, programID); err != nil {
		return MemberDetail{}, err
	}
	return s.GetMemberByID(ctx, tenantID, memberID)
}

func (s *Store) ListTrainers(ctx context.Context, tenantID string, limit int) ([]TrainerItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 24
	}
	rows, err := s.pool.Query(ctx, `
		SELECT id::text, full_name, COALESCE(specialty, ''), status, created_at
		FROM trainers
		WHERE tenant_id = $1::uuid
		ORDER BY created_at DESC
		LIMIT $2`, tenantID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]TrainerItem, 0)
	for rows.Next() {
		var item TrainerItem
		var createdAt sql.NullTime
		if err := rows.Scan(&item.ID, &item.FullName, &item.Specialty, &item.Status, &createdAt); err != nil {
			return nil, err
		}
		if createdAt.Valid {
			value := createdAt.Time.UTC()
			item.CreatedAt = &value
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) ListWorkoutPrograms(ctx context.Context, tenantID string, limit int) ([]WorkoutProgramItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 24
	}
	rows, err := s.pool.Query(ctx, `
		SELECT
			wp.id::text,
			wp.name,
			wp.status,
			COALESCE(wp.trainer_id::text, ''),
			COALESCE(t.full_name, ''),
			wp.created_at
		FROM workout_programs wp
		LEFT JOIN trainers t ON t.id = wp.trainer_id AND t.tenant_id = wp.tenant_id
		WHERE wp.tenant_id = $1::uuid
		ORDER BY wp.created_at DESC
		LIMIT $2`, tenantID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]WorkoutProgramItem, 0)
	for rows.Next() {
		var item WorkoutProgramItem
		var createdAt sql.NullTime
		if err := rows.Scan(&item.ID, &item.Name, &item.Status, &item.TrainerID, &item.TrainerName, &createdAt); err != nil {
			return nil, err
		}
		if createdAt.Valid {
			value := createdAt.Time.UTC()
			item.CreatedAt = &value
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) GetWorkoutProgramByID(ctx context.Context, tenantID, programID string) (WorkoutProgramItem, error) {
	var item WorkoutProgramItem
	var createdAt sql.NullTime
	err := s.pool.QueryRow(ctx, `
		SELECT
			wp.id::text,
			wp.name,
			wp.status,
			COALESCE(wp.trainer_id::text, ''),
			COALESCE(t.full_name, ''),
			wp.created_at
		FROM workout_programs wp
		LEFT JOIN trainers t ON t.id = wp.trainer_id AND t.tenant_id = wp.tenant_id
		WHERE wp.tenant_id = $1::uuid AND wp.id = $2::uuid
		LIMIT 1`, tenantID, programID).Scan(&item.ID, &item.Name, &item.Status, &item.TrainerID, &item.TrainerName, &createdAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return WorkoutProgramItem{}, ErrNoRows
		}
		return WorkoutProgramItem{}, err
	}
	if createdAt.Valid {
		value := createdAt.Time.UTC()
		item.CreatedAt = &value
	}
	return item, nil
}

func (s *Store) CreateWorkoutProgram(ctx context.Context, tenantID string, input WorkoutProgramInput) (WorkoutProgramItem, error) {
	if strings.TrimSpace(input.Name) == "" {
		return WorkoutProgramItem{}, errors.New("program name is required")
	}
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "active"
	}
	var programID string
	if err := s.pool.QueryRow(ctx, `
		INSERT INTO workout_programs (tenant_id, trainer_id, name, status)
		VALUES ($1::uuid, NULLIF($2, '')::uuid, $3, $4)
		RETURNING id::text`,
		tenantID, input.TrainerID, input.Name, status).Scan(&programID); err != nil {
		return WorkoutProgramItem{}, err
	}
	return s.GetWorkoutProgramByID(ctx, tenantID, programID)
}

func (s *Store) UpdateWorkoutProgram(ctx context.Context, tenantID, programID string, input WorkoutProgramInput) (WorkoutProgramItem, error) {
	if _, err := s.pool.Exec(ctx, `
		UPDATE workout_programs
		SET name = COALESCE(NULLIF($3, ''), name),
		    trainer_id = CASE WHEN $4 = '' THEN trainer_id ELSE $4::uuid END,
		    status = COALESCE(NULLIF($5, ''), status),
		    updated_at = now()
		WHERE tenant_id = $1::uuid AND id = $2::uuid`,
		tenantID, programID, input.Name, input.TrainerID, input.Status); err != nil {
		return WorkoutProgramItem{}, err
	}
	return s.GetWorkoutProgramByID(ctx, tenantID, programID)
}

func (s *Store) ListWorkoutSessions(ctx context.Context, tenantID string, limit int) ([]WorkoutSessionItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 24
	}
	rows, err := s.pool.Query(ctx, `
		SELECT
			ws.id::text,
			ws.program_id::text,
			COALESCE(wp.name, ''),
			COALESCE(ws.member_id::text, ''),
			ws.title,
			ws.day_label,
			ws.status,
			ws.notes,
			ws.completed_at,
			ws.created_at
		FROM workout_sessions ws
		LEFT JOIN workout_programs wp ON wp.id = ws.program_id AND wp.tenant_id = ws.tenant_id
		WHERE ws.tenant_id = $1::uuid
		ORDER BY ws.created_at DESC
		LIMIT $2`, tenantID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]WorkoutSessionItem, 0)
	for rows.Next() {
		var item WorkoutSessionItem
		var completedAt, createdAt sql.NullTime
		if err := rows.Scan(&item.ID, &item.ProgramID, &item.ProgramName, &item.MemberID, &item.Title, &item.DayLabel, &item.Status, &item.Notes, &completedAt, &createdAt); err != nil {
			return nil, err
		}
		if completedAt.Valid {
			value := completedAt.Time.UTC()
			item.CompletedAt = &value
		}
		if createdAt.Valid {
			value := createdAt.Time.UTC()
			item.CreatedAt = &value
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) ListProgramSessions(ctx context.Context, tenantID, programID string, limit int) ([]WorkoutSessionItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 24
	}
	rows, err := s.pool.Query(ctx, `
		SELECT
			ws.id::text,
			ws.program_id::text,
			COALESCE(wp.name, ''),
			COALESCE(ws.member_id::text, ''),
			ws.title,
			ws.day_label,
			ws.status,
			ws.notes,
			ws.completed_at,
			ws.created_at
		FROM workout_sessions ws
		LEFT JOIN workout_programs wp ON wp.id = ws.program_id AND wp.tenant_id = ws.tenant_id
		WHERE ws.tenant_id = $1::uuid AND ws.program_id = $2::uuid
		ORDER BY ws.created_at DESC
		LIMIT $3`, tenantID, programID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]WorkoutSessionItem, 0)
	for rows.Next() {
		var item WorkoutSessionItem
		var completedAt, createdAt sql.NullTime
		if err := rows.Scan(&item.ID, &item.ProgramID, &item.ProgramName, &item.MemberID, &item.Title, &item.DayLabel, &item.Status, &item.Notes, &completedAt, &createdAt); err != nil {
			return nil, err
		}
		if completedAt.Valid {
			value := completedAt.Time.UTC()
			item.CompletedAt = &value
		}
		if createdAt.Valid {
			value := createdAt.Time.UTC()
			item.CreatedAt = &value
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) GetWorkoutSessionByID(ctx context.Context, tenantID, sessionID string) (WorkoutSessionItem, error) {
	var item WorkoutSessionItem
	var completedAt, createdAt sql.NullTime
	err := s.pool.QueryRow(ctx, `
		SELECT
			ws.id::text,
			ws.program_id::text,
			COALESCE(wp.name, ''),
			COALESCE(ws.member_id::text, ''),
			ws.title,
			ws.day_label,
			ws.status,
			ws.notes,
			ws.completed_at,
			ws.created_at
		FROM workout_sessions ws
		LEFT JOIN workout_programs wp ON wp.id = ws.program_id AND wp.tenant_id = ws.tenant_id
		WHERE ws.tenant_id = $1::uuid AND ws.id = $2::uuid
		LIMIT 1`, tenantID, sessionID).Scan(&item.ID, &item.ProgramID, &item.ProgramName, &item.MemberID, &item.Title, &item.DayLabel, &item.Status, &item.Notes, &completedAt, &createdAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return WorkoutSessionItem{}, ErrNoRows
		}
		return WorkoutSessionItem{}, err
	}
	if completedAt.Valid {
		value := completedAt.Time.UTC()
		item.CompletedAt = &value
	}
	if createdAt.Valid {
		value := createdAt.Time.UTC()
		item.CreatedAt = &value
	}
	return item, nil
}

func (s *Store) CreateWorkoutSession(ctx context.Context, tenantID, programID string, input WorkoutSessionInput) (WorkoutSessionItem, error) {
	if strings.TrimSpace(input.Title) == "" {
		return WorkoutSessionItem{}, errors.New("session title is required")
	}
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "pending"
	}
	var sessionID string
	if err := s.pool.QueryRow(ctx, `
		INSERT INTO workout_sessions (tenant_id, program_id, member_id, title, day_label, status, notes)
		VALUES ($1::uuid, $2::uuid, NULLIF($3, '')::uuid, $4, $5, $6, $7)
		RETURNING id::text`,
		tenantID, programID, input.MemberID, input.Title, input.DayLabel, status, input.Notes).Scan(&sessionID); err != nil {
		return WorkoutSessionItem{}, err
	}
	return s.GetWorkoutSessionByID(ctx, tenantID, sessionID)
}

func (s *Store) UpdateWorkoutSession(ctx context.Context, tenantID, sessionID string, input WorkoutSessionInput) (WorkoutSessionItem, error) {
	if strings.TrimSpace(input.Title) == "" && strings.TrimSpace(input.DayLabel) == "" && strings.TrimSpace(input.MemberID) == "" && strings.TrimSpace(input.Notes) == "" && strings.TrimSpace(input.Status) == "" {
		return WorkoutSessionItem{}, errors.New("no session changes provided")
	}

	if _, err := s.pool.Exec(ctx, `
		UPDATE workout_sessions
		SET title = COALESCE(NULLIF($3, ''), title),
		    day_label = COALESCE(NULLIF($4, ''), day_label),
		    member_id = CASE WHEN $5 = '' THEN member_id ELSE $5::uuid END,
		    notes = COALESCE($6, notes),
		    status = COALESCE(NULLIF($7, ''), status),
		    updated_at = now()
		WHERE tenant_id = $1::uuid AND id = $2::uuid`,
		tenantID, sessionID, input.Title, input.DayLabel, input.MemberID, input.Notes, input.Status); err != nil {
		return WorkoutSessionItem{}, err
	}
	return s.GetWorkoutSessionByID(ctx, tenantID, sessionID)
}

func (s *Store) CompleteWorkoutSession(ctx context.Context, tenantID, sessionID string) (WorkoutSessionItem, error) {
	if _, err := s.pool.Exec(ctx, `
		UPDATE workout_sessions
		SET status = 'completed',
		    completed_at = COALESCE(completed_at, now()),
		    updated_at = now()
		WHERE tenant_id = $1::uuid AND id = $2::uuid`, tenantID, sessionID); err != nil {
		return WorkoutSessionItem{}, err
	}
	return s.GetWorkoutSessionByID(ctx, tenantID, sessionID)
}

func (s *Store) ListEquipment(ctx context.Context, tenantID string, limit int) ([]EquipmentItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 24
	}
	rows, err := s.pool.Query(ctx, `
		SELECT id::text, name, COALESCE(category, ''), quantity, status, last_maintenance_at
		FROM equipment
		WHERE tenant_id = $1::uuid
		ORDER BY created_at DESC
		LIMIT $2`, tenantID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]EquipmentItem, 0)
	for rows.Next() {
		var item EquipmentItem
		var lastMaintenance sql.NullTime
		if err := rows.Scan(&item.ID, &item.Name, &item.Category, &item.Quantity, &item.Status, &lastMaintenance); err != nil {
			return nil, err
		}
		if lastMaintenance.Valid {
			value := lastMaintenance.Time.UTC()
			item.LastMaintenanceAt = &value
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) ListAttendance(ctx context.Context, tenantID string, limit int) ([]AttendanceItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 24
	}
	rows, err := s.pool.Query(ctx, `
		SELECT
			a.id::text,
			a.member_id::text,
			COALESCE(m.full_name, 'Unknown Member'),
			a.checkin_at,
			a.checkout_at,
			a.source
		FROM attendance_logs a
		LEFT JOIN members m ON m.id = a.member_id AND m.tenant_id = a.tenant_id
		WHERE a.tenant_id = $1::uuid
		ORDER BY a.checkin_at DESC
		LIMIT $2`, tenantID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]AttendanceItem, 0)
	for rows.Next() {
		var item AttendanceItem
		var checkout sql.NullTime
		if err := rows.Scan(&item.ID, &item.MemberID, &item.MemberName, &item.CheckinAt, &checkout, &item.Source); err != nil {
			return nil, err
		}
		if checkout.Valid {
			value := checkout.Time.UTC()
			item.CheckoutAt = &value
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) ListSMSAutomationRules(ctx context.Context, tenantID string, limit int) ([]SMSAutomationRuleItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 24
	}
	rows, err := s.pool.Query(ctx, `
		SELECT id::text, rule_name, trigger_type, condition, message_template, channel, status, last_triggered_at, next_trigger_at, created_at, updated_at
		FROM sms_automation_rules
		WHERE tenant_id = $1::uuid
		ORDER BY created_at DESC
		LIMIT $2`, tenantID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]SMSAutomationRuleItem, 0)
	for rows.Next() {
		var item SMSAutomationRuleItem
		var conditionJSON []byte
		var lastTriggeredAt, nextTriggerAt, createdAt, updatedAt sql.NullTime
		if err := rows.Scan(&item.ID, &item.RuleName, &item.TriggerType, &conditionJSON, &item.MessageTemplate, &item.Channel, &item.Status, &lastTriggeredAt, &nextTriggerAt, &createdAt, &updatedAt); err != nil {
			return nil, err
		}
		item.Condition = map[string]any{}
		if len(conditionJSON) > 0 {
			_ = json.Unmarshal(conditionJSON, &item.Condition)
		}
		if lastTriggeredAt.Valid {
			value := lastTriggeredAt.Time.UTC()
			item.LastTriggeredAt = &value
		}
		if nextTriggerAt.Valid {
			value := nextTriggerAt.Time.UTC()
			item.NextTriggerAt = &value
		}
		if createdAt.Valid {
			value := createdAt.Time.UTC()
			item.CreatedAt = &value
		}
		if updatedAt.Valid {
			value := updatedAt.Time.UTC()
			item.UpdatedAt = &value
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) UpsertSMSAutomationRule(ctx context.Context, tenantID string, input SMSAutomationRuleInput) (SMSAutomationRuleItem, error) {
	if strings.TrimSpace(input.RuleName) == "" {
		return SMSAutomationRuleItem{}, errors.New("rule name is required")
	}
	if strings.TrimSpace(input.TriggerType) == "" {
		return SMSAutomationRuleItem{}, errors.New("trigger type is required")
	}
	if strings.TrimSpace(input.MessageTemplate) == "" {
		return SMSAutomationRuleItem{}, errors.New("message template is required")
	}
	channel := strings.TrimSpace(input.Channel)
	if channel == "" {
		channel = "sms"
	}
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "active"
	}
	condition := input.Condition
	if condition == nil {
		condition = map[string]any{}
	}
	conditionJSON, err := json.Marshal(condition)
	if err != nil {
		return SMSAutomationRuleItem{}, err
	}

	var lastTriggeredAt, nextTriggerAt any
	if input.LastTriggeredAt != nil {
		lastTriggeredAt = input.LastTriggeredAt.UTC()
	}
	if input.NextTriggerAt != nil {
		nextTriggerAt = input.NextTriggerAt.UTC()
	}

	var ruleID string
	if err := s.pool.QueryRow(ctx, `
		INSERT INTO sms_automation_rules (
			tenant_id, rule_name, trigger_type, condition, message_template, channel, status, last_triggered_at, next_trigger_at
		)
		VALUES ($1::uuid, $2, $3, $4::jsonb, $5, $6, $7, $8, $9)
		ON CONFLICT (tenant_id, rule_name, trigger_type) DO UPDATE SET
			condition = EXCLUDED.condition,
			message_template = EXCLUDED.message_template,
			channel = EXCLUDED.channel,
			status = EXCLUDED.status,
			last_triggered_at = EXCLUDED.last_triggered_at,
			next_trigger_at = EXCLUDED.next_trigger_at,
			updated_at = now()
		RETURNING id::text`,
		tenantID, input.RuleName, input.TriggerType, conditionJSON, input.MessageTemplate, channel, status, lastTriggeredAt, nextTriggerAt).Scan(&ruleID); err != nil {
		return SMSAutomationRuleItem{}, err
	}
	return s.GetSMSAutomationRuleByID(ctx, tenantID, ruleID)
}

func (s *Store) UpdateSMSAutomationRule(ctx context.Context, tenantID, ruleID string, input SMSAutomationRuleInput) (SMSAutomationRuleItem, error) {
	if strings.TrimSpace(ruleID) == "" {
		return SMSAutomationRuleItem{}, errors.New("rule id is required")
	}
	if strings.TrimSpace(input.RuleName) == "" {
		return SMSAutomationRuleItem{}, errors.New("rule name is required")
	}
	if strings.TrimSpace(input.TriggerType) == "" {
		return SMSAutomationRuleItem{}, errors.New("trigger type is required")
	}
	if strings.TrimSpace(input.MessageTemplate) == "" {
		return SMSAutomationRuleItem{}, errors.New("message template is required")
	}
	channel := strings.TrimSpace(input.Channel)
	if channel == "" {
		channel = "sms"
	}
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "active"
	}
	condition := input.Condition
	if condition == nil {
		condition = map[string]any{}
	}
	conditionJSON, err := json.Marshal(condition)
	if err != nil {
		return SMSAutomationRuleItem{}, err
	}

	var lastTriggeredAt, nextTriggerAt any
	if input.LastTriggeredAt != nil {
		lastTriggeredAt = input.LastTriggeredAt.UTC()
	}
	if input.NextTriggerAt != nil {
		nextTriggerAt = input.NextTriggerAt.UTC()
	}

	if _, err := s.pool.Exec(ctx, `
		UPDATE sms_automation_rules
		SET rule_name = $3,
		    trigger_type = $4,
		    condition = $5::jsonb,
		    message_template = $6,
		    channel = $7,
		    status = $8,
		    last_triggered_at = $9,
		    next_trigger_at = $10,
		    updated_at = now()
		WHERE tenant_id = $1::uuid AND id = $2::uuid`,
		tenantID, ruleID, input.RuleName, input.TriggerType, conditionJSON, input.MessageTemplate, channel, status, lastTriggeredAt, nextTriggerAt); err != nil {
		return SMSAutomationRuleItem{}, err
	}
	return s.GetSMSAutomationRuleByID(ctx, tenantID, ruleID)
}

func (s *Store) GetSMSAutomationRuleByID(ctx context.Context, tenantID, ruleID string) (SMSAutomationRuleItem, error) {
	var item SMSAutomationRuleItem
	var conditionJSON []byte
	var lastTriggeredAt, nextTriggerAt, createdAt, updatedAt sql.NullTime
	err := s.pool.QueryRow(ctx, `
		SELECT id::text, rule_name, trigger_type, condition, message_template, channel, status, last_triggered_at, next_trigger_at, created_at, updated_at
		FROM sms_automation_rules
		WHERE tenant_id = $1::uuid AND id = $2::uuid
		LIMIT 1`, tenantID, ruleID).Scan(&item.ID, &item.RuleName, &item.TriggerType, &conditionJSON, &item.MessageTemplate, &item.Channel, &item.Status, &lastTriggeredAt, &nextTriggerAt, &createdAt, &updatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return SMSAutomationRuleItem{}, ErrNoRows
		}
		return SMSAutomationRuleItem{}, err
	}
	item.Condition = map[string]any{}
	if len(conditionJSON) > 0 {
		_ = json.Unmarshal(conditionJSON, &item.Condition)
	}
	if lastTriggeredAt.Valid {
		value := lastTriggeredAt.Time.UTC()
		item.LastTriggeredAt = &value
	}
	if nextTriggerAt.Valid {
		value := nextTriggerAt.Time.UTC()
		item.NextTriggerAt = &value
	}
	if createdAt.Valid {
		value := createdAt.Time.UTC()
		item.CreatedAt = &value
	}
	if updatedAt.Valid {
		value := updatedAt.Time.UTC()
		item.UpdatedAt = &value
	}
	return item, nil
}

func (s *Store) DeleteSMSAutomationRule(ctx context.Context, tenantID, ruleID string) error {
	_, err := s.pool.Exec(ctx, `
		DELETE FROM sms_automation_rules
		WHERE tenant_id = $1::uuid AND id = $2::uuid`, tenantID, ruleID)
	return err
}

func (s *Store) ListSMSAutomationLogs(ctx context.Context, tenantID string, limit int) ([]SMSAutomationLogItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 24
	}
	rows, err := s.pool.Query(ctx, `
		SELECT id::text, channel, status, message, metadata, sent_at, created_at
		FROM sms_automation_logs
		WHERE tenant_id = $1::uuid
		ORDER BY created_at DESC
		LIMIT $2`, tenantID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]SMSAutomationLogItem, 0)
	for rows.Next() {
		var item SMSAutomationLogItem
		var metadataJSON []byte
		var sentAt, createdAt sql.NullTime
		if err := rows.Scan(&item.ID, &item.Channel, &item.Status, &item.Message, &metadataJSON, &sentAt, &createdAt); err != nil {
			return nil, err
		}
		item.Metadata = map[string]any{}
		if len(metadataJSON) > 0 {
			_ = json.Unmarshal(metadataJSON, &item.Metadata)
		}
		if sentAt.Valid {
			value := sentAt.Time.UTC()
			item.SentAt = &value
		}
		if createdAt.Valid {
			value := createdAt.Time.UTC()
			item.CreatedAt = &value
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) Subscription(ctx context.Context, tenantID string) (map[string]any, error) {
	var planCode, planName, status, billingCycle string
	var startsAt time.Time
	var endsAt sql.NullTime
	err := s.withTenantTx(ctx, tenantID, func(tx pgx.Tx) error {
		return tx.QueryRow(ctx, `
			SELECT
				g.plan_code,
				COALESCE(p.name, g.plan_code),
				COALESCE(s.status, 'inactive'),
				COALESCE(s.billing_cycle, 'monthly'),
				COALESCE(s.starts_at, now()),
				s.ends_at
			FROM gyms g
			LEFT JOIN LATERAL (
				SELECT *
				FROM subscriptions sub
				WHERE sub.tenant_id = g.id
				ORDER BY sub.created_at DESC
				LIMIT 1
			) s ON true
		LEFT JOIN pricing_plans p ON p.id = s.plan_id
			WHERE g.id = $1::uuid`, tenantID).Scan(&planCode, &planName, &status, &billingCycle, &startsAt, &endsAt)
	})
	if err != nil {
		return nil, err
	}

	out := map[string]any{
		"planCode":     planCode,
		"planName":     planName,
		"status":       status,
		"billingCycle": billingCycle,
		"startsAt":     startsAt.UTC(),
	}
	if endsAt.Valid {
		out["endsAt"] = endsAt.Time.UTC()
	}
	return out, nil
}

func (s *Store) CreateGym(ctx context.Context, input GymCreateInput) (CreatedGym, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.Slug = strings.TrimSpace(strings.ToLower(input.Slug))
	input.Subdomain = strings.TrimSpace(strings.ToLower(input.Subdomain))
	input.PlanCode = strings.TrimSpace(strings.ToLower(input.PlanCode))
	input.OwnerEmail = strings.TrimSpace(strings.ToLower(input.OwnerEmail))
	input.OwnerPassword = strings.TrimSpace(input.OwnerPassword)
	input.OwnerPhone = strings.TrimSpace(input.OwnerPhone)
	input.Timezone = strings.TrimSpace(input.Timezone)

	if input.Name == "" {
		return CreatedGym{}, errors.New("gym name is required")
	}
	if input.Slug == "" {
		input.Slug = slugify(input.Name)
	}
	if input.Subdomain == "" {
		input.Subdomain = input.Slug
	}
	if input.PlanCode == "" {
		input.PlanCode = "starter"
	}
	if input.Timezone == "" {
		input.Timezone = "Asia/Tehran"
	}
	if input.OwnerEmail == "" {
		input.OwnerEmail = fmt.Sprintf("owner@%s.quantumfit.ir", input.Slug)
	}
	if input.OwnerPassword == "" {
		input.OwnerPassword = "Temp#2026"
	}

	tx, err := s.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return CreatedGym{}, err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `SELECT set_config('app.tenant_id', 'platform', true)`); err != nil {
		return CreatedGym{}, err
	}

	var gymID string
	err = tx.QueryRow(ctx, `
		INSERT INTO gyms (slug, name, status, plan_code, subdomain, tenant_type, timezone, onboarding_status)
		VALUES ($1, $2, 'active', $3, $4, 'shared', $5, 'pending')
		ON CONFLICT (slug) DO UPDATE SET
			name = EXCLUDED.name,
			plan_code = EXCLUDED.plan_code,
			subdomain = EXCLUDED.subdomain,
			timezone = EXCLUDED.timezone,
			updated_at = now()
		RETURNING id::text`,
		input.Slug, input.Name, input.PlanCode, input.Subdomain, input.Timezone).Scan(&gymID)
	if err != nil {
		return CreatedGym{}, err
	}

	ownerHash, err := bcrypt.GenerateFromPassword([]byte(input.OwnerPassword), bcrypt.DefaultCost)
	if err != nil {
		return CreatedGym{}, err
	}

	var ownerID string
	err = tx.QueryRow(ctx, `
		INSERT INTO users (email, phone, password_hash, status)
		VALUES ($1, $2, $3, 'active')
		ON CONFLICT (email) DO UPDATE SET
			phone = COALESCE(EXCLUDED.phone, users.phone),
			password_hash = EXCLUDED.password_hash,
			updated_at = now()
		RETURNING id::text`,
		input.OwnerEmail, nullIfEmpty(input.OwnerPhone), string(ownerHash)).Scan(&ownerID)
	if err != nil {
		return CreatedGym{}, err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO gym_users (tenant_id, user_id, role, status, first_login_completed_at)
		VALUES ($1::uuid, $2::uuid, 'gym_owner', 'active', null)
		ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status`,
		gymID, ownerID); err != nil {
		return CreatedGym{}, err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO tenant_domains (tenant_id, subdomain, custom_domain, panel_type, is_active)
		VALUES ($1::uuid, $2, null, 'gym', true)
		ON CONFLICT (subdomain) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, panel_type = EXCLUDED.panel_type, is_active = true`,
		gymID, input.Subdomain); err != nil {
		return CreatedGym{}, err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO onboarding_state (tenant_id, step, payload, completed_at)
		VALUES ($1::uuid, 'gym_name', jsonb_build_object(
			'gymName', $2,
			'gymType', $3,
			'location', $4,
			'sizeSqm', $5,
			'timezone', $6
		), null)
		ON CONFLICT (tenant_id) DO UPDATE SET
			step = EXCLUDED.step,
			payload = EXCLUDED.payload,
			completed_at = null,
			updated_at = now()`,
		gymID, input.Name, input.GymType, input.Location, input.SizeSqm, input.Timezone); err != nil {
		return CreatedGym{}, err
	}

	if _, err := tx.Exec(ctx, `DELETE FROM subscriptions WHERE tenant_id = $1::uuid`, gymID); err != nil {
		return CreatedGym{}, err
	}

	var planID sql.NullString
	if err := tx.QueryRow(ctx, `SELECT id::text FROM pricing_plans WHERE code = $1 LIMIT 1`, input.PlanCode).Scan(&planID); err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return CreatedGym{}, err
	}
	if planID.Valid {
		if _, err := tx.Exec(ctx, `
			INSERT INTO subscriptions (tenant_id, plan_id, status, starts_at, ends_at, billing_cycle)
			VALUES ($1::uuid, $2::uuid, 'active', now(), now() + interval '1 month', 'monthly')`,
			gymID, planID.String); err != nil {
			return CreatedGym{}, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return CreatedGym{}, err
	}

	createdGym, err := s.GetGymByTenantID(ctx, gymID)
	if err != nil {
		return CreatedGym{}, err
	}

	return CreatedGym{Gym: createdGym, OwnerID: ownerID}, nil
}

func (s *Store) AuthenticateUser(ctx context.Context, tenantID, email, password string) (auth.Claims, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	password = strings.TrimSpace(password)
	if email == "" || password == "" {
		return auth.Claims{}, errors.New("email and password are required")
	}

	type userRow struct {
		ID       string
		TenantID sql.NullString
		Role     string
		Hash     string
		Panel    string
	}

	var row userRow
	err := s.pool.QueryRow(ctx, `
		SELECT
			u.id::text,
			COALESCE(gu.tenant_id::text, ''),
			COALESCE(gu.role, 'admin'),
			u.password_hash,
			COALESCE(td.panel_type, 'admin')
		FROM users u
		LEFT JOIN gym_users gu ON gu.user_id = u.id
		LEFT JOIN gyms g ON g.id = gu.tenant_id
		LEFT JOIN tenant_domains td ON td.tenant_id = g.id AND td.is_active = true
		WHERE lower(u.email) = $1
		ORDER BY CASE
			WHEN $2 = '' AND gu.user_id IS NULL THEN 0
			WHEN gu.tenant_id::text = $2 THEN 0
			ELSE 1
		END
		LIMIT 1`, email, tenantID).Scan(&row.ID, &row.TenantID, &row.Role, &row.Hash, &row.Panel)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return auth.Claims{}, ErrNoRows
		}
		return auth.Claims{}, err
	}

	if bcrypt.CompareHashAndPassword([]byte(row.Hash), []byte(password)) != nil {
		return auth.Claims{}, errors.New("invalid credentials")
	}

	resolvedTenant := tenantID
	if row.TenantID.Valid {
		resolvedTenant = row.TenantID.String
	}
	if tenantID == "" && row.TenantID.Valid {
		return auth.Claims{}, ErrNoRows
	}
	if tenantID != "" && !row.TenantID.Valid {
		return auth.Claims{}, ErrNoRows
	}
	if resolvedTenant == "" {
		resolvedTenant = "platform"
	}

	return auth.Claims{
		UserID:    row.ID,
		TenantID:  resolvedTenant,
		Role:      auth.Role(row.Role),
		Panel:     row.Panel,
		SessionID: fmt.Sprintf("session-%d", time.Now().UTC().UnixNano()),
	}, nil
}

func tokenHash(token string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(token)))
	return hex.EncodeToString(sum[:])
}

func (s *Store) SaveRefreshToken(ctx context.Context, userID, tenantID, token string, expiresAt time.Time) error {
	_, err := s.pool.Exec(ctx, `
		INSERT INTO refresh_tokens (user_id, tenant_id, token_hash, expires_at)
		VALUES ($1::uuid, $2::uuid, $3, $4)`,
		userID, tenantID, tokenHash(token), expiresAt.UTC())
	return err
}

func (s *Store) RevokeRefreshToken(ctx context.Context, token string) error {
	_, err := s.pool.Exec(ctx, `
		UPDATE refresh_tokens
		SET revoked_at = now()
		WHERE token_hash = $1 AND revoked_at IS NULL`,
		tokenHash(token))
	return err
}

func (s *Store) RefreshTokenExists(ctx context.Context, token string) (bool, error) {
	var found bool
	err := s.pool.QueryRow(ctx, `
		SELECT true
		FROM refresh_tokens
		WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()
		LIMIT 1`, tokenHash(token)).Scan(&found)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return found, nil
}

func (s *Store) ResolveTenant(ctx context.Context, subdomain string) (tenant.Tenant, error) {
	if strings.TrimSpace(subdomain) == "" {
		return tenant.Tenant{}, ErrNoRows
	}
	return s.GetTenantBySubdomain(ctx, subdomain)
}

func slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = strings.ReplaceAll(value, "&", " and ")
	value = strings.ReplaceAll(value, " ", "-")
	value = strings.ReplaceAll(value, "_", "-")
	value = strings.ReplaceAll(value, "/", "-")
	value = strings.ReplaceAll(value, "--", "-")
	value = strings.Trim(value, "-")
	if value == "" {
		return "gym"
	}
	return value
}

func nullIfEmpty(value string) any {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
}
