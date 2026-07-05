package db

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

type CustomerDiscountRecord struct {
	ID             string     `json:"id"`
	GymID          string     `json:"gymId"`
	GymName        string     `json:"gymName,omitempty"`
	PlanCode       string     `json:"planCode"`
	DiscountType   string     `json:"discountType"`
	DiscountValue  float64    `json:"discountValue"`
	DurationMonths int        `json:"durationMonths"`
	StartsAt       time.Time  `json:"startsAt"`
	EndsAt         *time.Time `json:"endsAt,omitempty"`
	Reason         string     `json:"reason"`
	IsActive       bool       `json:"isActive"`
	Stackable      bool       `json:"stackable"`
	CreatedBy      string     `json:"createdBy,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

type CustomerDiscountUpsertInput struct {
	GymID          string     `json:"gymId"`
	PlanCode       string     `json:"planCode"`
	DiscountType   string     `json:"discountType"`
	DiscountValue  float64    `json:"discountValue"`
	DurationMonths int        `json:"durationMonths"`
	StartsAt       *time.Time `json:"startsAt"`
	EndsAt         *time.Time `json:"endsAt"`
	Reason         string     `json:"reason"`
	IsActive       *bool      `json:"isActive"`
	Stackable      bool       `json:"stackable"`
	CreatedBy      string     `json:"createdBy"`
}

type DemoAccessRecord struct {
	ID                 string    `json:"id"`
	TenantID           string    `json:"tenantId,omitempty"`
	DemoType           string    `json:"demoType"`
	PanelType          string    `json:"panelType"`
	AccountName        string    `json:"accountName"`
	Username           string    `json:"username"`
	FeatureAccessLevel string    `json:"featureAccessLevel"`
	ReadOnly           bool      `json:"readOnly"`
	ExpiresAt          time.Time `json:"expiresAt"`
	IsActive           bool      `json:"isActive"`
	Notes              string    `json:"notes,omitempty"`
	CreatedBy          string    `json:"createdBy,omitempty"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
	TemporaryPassword  string    `json:"temporaryPassword,omitempty"`
}

type DemoAccessUpsertInput struct {
	TenantID           string    `json:"tenantId"`
	DemoType           string    `json:"demoType"`
	PanelType          string    `json:"panelType"`
	AccountName        string    `json:"accountName"`
	Username           string    `json:"username"`
	Password           string    `json:"password"`
	FeatureAccessLevel string    `json:"featureAccessLevel"`
	ReadOnly           bool      `json:"readOnly"`
	ExpiresAt          time.Time `json:"expiresAt"`
	IsActive           *bool     `json:"isActive"`
	Notes              string    `json:"notes"`
	CreatedBy          string    `json:"createdBy"`
}

type DemoRequestRecord struct {
	ID          string         `json:"id"`
	RequestType string         `json:"requestType"`
	PanelType   string         `json:"panelType"`
	Name        string         `json:"name"`
	Email       string         `json:"email"`
	Phone       string         `json:"phone,omitempty"`
	CompanyName string         `json:"companyName,omitempty"`
	Message     string         `json:"message"`
	Status      string         `json:"status"`
	Source      string         `json:"source"`
	Metadata    map[string]any `json:"metadata"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
}

type DemoRequestUpsertInput struct {
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

type MediaFileRecord struct {
	ID        string         `json:"id"`
	GymID     string         `json:"gymId,omitempty"`
	Kind      string         `json:"kind"`
	URL       string         `json:"url"`
	Alt       string         `json:"alt"`
	Metadata  map[string]any `json:"metadata"`
	CreatedAt time.Time      `json:"createdAt"`
}

type MediaFileUpsertInput struct {
	GymID    string         `json:"gymId"`
	Kind     string         `json:"kind"`
	URL      string         `json:"url"`
	Alt      string         `json:"alt"`
	Metadata map[string]any `json:"metadata"`
}

type PricingQuote struct {
	PlanCode            string     `json:"planCode"`
	BillingCycle        string     `json:"billingCycle"`
	Currency            string     `json:"currency"`
	BasePrice           float64    `json:"basePrice"`
	CustomerDiscount    float64    `json:"customerDiscount"`
	CouponDiscount      float64    `json:"couponDiscount"`
	FinalPrice          float64    `json:"finalPrice"`
	DiscountedByCoupon  bool       `json:"discountedByCoupon"`
	AppliedCouponCode   string     `json:"appliedCouponCode,omitempty"`
	AppliedDiscountName string     `json:"appliedDiscountName,omitempty"`
	ValidUntil          *time.Time `json:"validUntil,omitempty"`
}

func (s *Store) ListCustomerDiscounts(ctx context.Context) ([]CustomerDiscountRecord, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT
			cd.id::text,
			cd.gym_id::text,
			g.name,
			cd.plan_code,
			cd.discount_type,
			cd.discount_value,
			cd.duration_months,
			cd.starts_at,
			cd.ends_at,
			cd.reason,
			cd.is_active,
			cd.stackable,
			COALESCE(cd.created_by::text, ''),
			cd.created_at,
			cd.updated_at
		FROM customer_discounts cd
		JOIN gyms g ON g.id = cd.gym_id
		ORDER BY cd.created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]CustomerDiscountRecord, 0)
	for rows.Next() {
		var item CustomerDiscountRecord
		var endsAt sql.NullTime
		if err := rows.Scan(&item.ID, &item.GymID, &item.GymName, &item.PlanCode, &item.DiscountType, &item.DiscountValue, &item.DurationMonths, &item.StartsAt, &endsAt, &item.Reason, &item.IsActive, &item.Stackable, &item.CreatedBy, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		if endsAt.Valid {
			value := endsAt.Time.UTC()
			item.EndsAt = &value
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) UpsertCustomerDiscount(ctx context.Context, input CustomerDiscountUpsertInput) (CustomerDiscountRecord, error) {
	if strings.TrimSpace(input.GymID) == "" || strings.TrimSpace(input.PlanCode) == "" {
		return CustomerDiscountRecord{}, errors.New("gym and plan are required")
	}
	if input.StartsAt == nil {
		now := time.Now().UTC()
		input.StartsAt = &now
	}
	active := true
	if input.IsActive != nil {
		active = *input.IsActive
	}
	var id string
	if err := s.pool.QueryRow(ctx, `
		INSERT INTO customer_discounts (gym_id, plan_code, discount_type, discount_value, duration_months, starts_at, ends_at, reason, is_active, stackable, created_by)
		VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULLIF($11, '')::uuid)
		ON CONFLICT DO NOTHING
		RETURNING id::text`,
		input.GymID, input.PlanCode, input.DiscountType, input.DiscountValue, maxInt(input.DurationMonths, 1), input.StartsAt, input.EndsAt, input.Reason, active, input.Stackable, input.CreatedBy).Scan(&id); err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return CustomerDiscountRecord{}, err
		}
	}
	if strings.TrimSpace(id) == "" {
		if err := s.pool.QueryRow(ctx, `
			SELECT id::text
			FROM customer_discounts
			WHERE gym_id = $1::uuid AND plan_code = $2
			ORDER BY created_at DESC
			LIMIT 1`, input.GymID, input.PlanCode).Scan(&id); err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return CustomerDiscountRecord{}, ErrNoRows
			}
			return CustomerDiscountRecord{}, err
		}
		if _, err := s.pool.Exec(ctx, `
			UPDATE customer_discounts
			SET discount_type = $2,
			    discount_value = $3,
			    duration_months = $4,
			    starts_at = $5,
			    ends_at = $6,
			    reason = $7,
			    is_active = $8,
			    stackable = $9,
			    updated_at = now()
			WHERE id = $1::uuid`,
			id, input.DiscountType, input.DiscountValue, maxInt(input.DurationMonths, 1), input.StartsAt, input.EndsAt, input.Reason, active, input.Stackable); err != nil {
			return CustomerDiscountRecord{}, err
		}
	}
	return s.GetCustomerDiscountByID(ctx, id)
}

func (s *Store) GetCustomerDiscountByID(ctx context.Context, id string) (CustomerDiscountRecord, error) {
	var item CustomerDiscountRecord
	var endsAt sql.NullTime
	err := s.pool.QueryRow(ctx, `
		SELECT
			cd.id::text,
			cd.gym_id::text,
			g.name,
			cd.plan_code,
			cd.discount_type,
			cd.discount_value,
			cd.duration_months,
			cd.starts_at,
			cd.ends_at,
			cd.reason,
			cd.is_active,
			cd.stackable,
			COALESCE(cd.created_by::text, ''),
			cd.created_at,
			cd.updated_at
		FROM customer_discounts cd
		JOIN gyms g ON g.id = cd.gym_id
		WHERE cd.id = $1::uuid
		LIMIT 1`, id).Scan(&item.ID, &item.GymID, &item.GymName, &item.PlanCode, &item.DiscountType, &item.DiscountValue, &item.DurationMonths, &item.StartsAt, &endsAt, &item.Reason, &item.IsActive, &item.Stackable, &item.CreatedBy, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return CustomerDiscountRecord{}, ErrNoRows
		}
		return CustomerDiscountRecord{}, err
	}
	if endsAt.Valid {
		value := endsAt.Time.UTC()
		item.EndsAt = &value
	}
	return item, nil
}

func (s *Store) DeleteCustomerDiscount(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM customer_discounts WHERE id = $1::uuid`, id)
	return err
}

func (s *Store) ListDemoAccesses(ctx context.Context) ([]DemoAccessRecord, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT
			da.id::text,
			COALESCE(da.tenant_id::text, ''),
			da.demo_type,
			da.panel_type,
			da.account_name,
			da.username,
			da.feature_access_level,
			da.read_only,
			da.expires_at,
			da.is_active,
			da.notes,
			COALESCE(da.created_by::text, ''),
			da.created_at,
			da.updated_at
		FROM demo_accesses da
		ORDER BY da.created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]DemoAccessRecord, 0)
	for rows.Next() {
		var item DemoAccessRecord
		if err := rows.Scan(&item.ID, &item.TenantID, &item.DemoType, &item.PanelType, &item.AccountName, &item.Username, &item.FeatureAccessLevel, &item.ReadOnly, &item.ExpiresAt, &item.IsActive, &item.Notes, &item.CreatedBy, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) UpsertDemoAccess(ctx context.Context, input DemoAccessUpsertInput) (DemoAccessRecord, error) {
	if strings.TrimSpace(input.DemoType) == "" {
		return DemoAccessRecord{}, errors.New("demo type is required")
	}
	if strings.TrimSpace(input.PanelType) == "" {
		return DemoAccessRecord{}, errors.New("panel type is required")
	}
	if strings.TrimSpace(input.Username) == "" {
		input.Username = fmt.Sprintf("%s-%d", strings.TrimSpace(input.PanelType), time.Now().UTC().UnixNano())
	}
	if strings.TrimSpace(input.Password) == "" {
		input.Password = generateDemoPassword()
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return DemoAccessRecord{}, err
	}
	active := true
	if input.IsActive != nil {
		active = *input.IsActive
	}
	var id string
	if err := s.pool.QueryRow(ctx, `
		INSERT INTO demo_accesses (tenant_id, demo_type, panel_type, account_name, username, password_hash, feature_access_level, read_only, expires_at, is_active, created_by, notes)
		VALUES (NULLIF($1, '')::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULLIF($11, '')::uuid, $12)
		ON CONFLICT (username) DO UPDATE SET
			tenant_id = EXCLUDED.tenant_id,
			demo_type = EXCLUDED.demo_type,
			panel_type = EXCLUDED.panel_type,
			account_name = EXCLUDED.account_name,
			password_hash = EXCLUDED.password_hash,
			feature_access_level = EXCLUDED.feature_access_level,
			read_only = EXCLUDED.read_only,
			expires_at = EXCLUDED.expires_at,
			is_active = EXCLUDED.is_active,
			created_by = EXCLUDED.created_by,
			notes = EXCLUDED.notes,
			updated_at = now()
		RETURNING id::text`,
		input.TenantID, input.DemoType, input.PanelType, input.AccountName, input.Username, string(hash), input.FeatureAccessLevel, input.ReadOnly, input.ExpiresAt.UTC(), active, input.CreatedBy, input.Notes).Scan(&id); err != nil {
		return DemoAccessRecord{}, err
	}
	record, err := s.GetDemoAccessByID(ctx, id)
	if err != nil {
		return DemoAccessRecord{}, err
	}
	record.TemporaryPassword = input.Password
	return record, nil
}

func (s *Store) GetDemoAccessByID(ctx context.Context, id string) (DemoAccessRecord, error) {
	var item DemoAccessRecord
	err := s.pool.QueryRow(ctx, `
		SELECT
			da.id::text,
			COALESCE(da.tenant_id::text, ''),
			da.demo_type,
			da.panel_type,
			da.account_name,
			da.username,
			da.feature_access_level,
			da.read_only,
			da.expires_at,
			da.is_active,
			da.notes,
			COALESCE(da.created_by::text, ''),
			da.created_at,
			da.updated_at
		FROM demo_accesses da
		WHERE da.id = $1::uuid
		LIMIT 1`, id).Scan(&item.ID, &item.TenantID, &item.DemoType, &item.PanelType, &item.AccountName, &item.Username, &item.FeatureAccessLevel, &item.ReadOnly, &item.ExpiresAt, &item.IsActive, &item.Notes, &item.CreatedBy, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return DemoAccessRecord{}, ErrNoRows
		}
		return DemoAccessRecord{}, err
	}
	return item, nil
}

func (s *Store) DeleteDemoAccess(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM demo_accesses WHERE id = $1::uuid`, id)
	return err
}

func (s *Store) CreateDemoRequest(ctx context.Context, input DemoRequestUpsertInput) (DemoRequestRecord, error) {
	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Email) == "" {
		return DemoRequestRecord{}, errors.New("name and email are required")
	}
	metadataJSON, err := json.Marshal(defaultMap(input.Metadata))
	if err != nil {
		return DemoRequestRecord{}, err
	}
	if strings.TrimSpace(input.RequestType) == "" {
		input.RequestType = "demo"
	}
	if strings.TrimSpace(input.PanelType) == "" {
		input.PanelType = "gym"
	}
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "new"
	}
	source := strings.TrimSpace(input.Source)
	if source == "" {
		source = "website"
	}
	var item DemoRequestRecord
	if err := s.pool.QueryRow(ctx, `
		INSERT INTO demo_requests (request_type, panel_type, name, email, phone, company_name, message, status, source, metadata)
		VALUES ($1, $2, $3, lower($4), $5, $6, $7, $8, $9, $10::jsonb)
		RETURNING id::text, request_type, panel_type, name, email, phone, company_name, message, status, source, metadata, created_at, updated_at`,
		input.RequestType, input.PanelType, input.Name, input.Email, input.Phone, input.CompanyName, input.Message, status, source, string(metadataJSON)).Scan(&item.ID, &item.RequestType, &item.PanelType, &item.Name, &item.Email, &item.Phone, &item.CompanyName, &item.Message, &item.Status, &item.Source, &metadataJSON, &item.CreatedAt, &item.UpdatedAt); err != nil {
		return DemoRequestRecord{}, err
	}
	_ = json.Unmarshal(metadataJSON, &item.Metadata)
	return item, nil
}

func (s *Store) ListDemoRequests(ctx context.Context) ([]DemoRequestRecord, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id::text, request_type, panel_type, name, email, phone, company_name, message, status, source, metadata, created_at, updated_at
		FROM demo_requests
		ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]DemoRequestRecord, 0)
	for rows.Next() {
		var item DemoRequestRecord
		var metadataJSON []byte
		if err := rows.Scan(&item.ID, &item.RequestType, &item.PanelType, &item.Name, &item.Email, &item.Phone, &item.CompanyName, &item.Message, &item.Status, &item.Source, &metadataJSON, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		item.Metadata = map[string]any{}
		_ = json.Unmarshal(metadataJSON, &item.Metadata)
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) UpdateDemoRequestStatus(ctx context.Context, id, status string) (DemoRequestRecord, error) {
	if strings.TrimSpace(status) == "" {
		return DemoRequestRecord{}, errors.New("status is required")
	}
	if _, err := s.pool.Exec(ctx, `UPDATE demo_requests SET status = $2, updated_at = now() WHERE id = $1::uuid`, id, status); err != nil {
		return DemoRequestRecord{}, err
	}
	requests, err := s.ListDemoRequests(ctx)
	if err != nil {
		return DemoRequestRecord{}, err
	}
	for _, req := range requests {
		if req.ID == id {
			return req, nil
		}
	}
	return DemoRequestRecord{}, ErrNoRows
}

func (s *Store) ListMediaFiles(ctx context.Context, gymID string) ([]MediaFileRecord, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id::text, COALESCE(gym_id::text, ''), kind, url, alt, metadata, created_at
		FROM media_files
		WHERE ($1 = '' OR gym_id::text = $1)
		ORDER BY created_at DESC`, gymID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]MediaFileRecord, 0)
	for rows.Next() {
		var item MediaFileRecord
		var metadataJSON []byte
		if err := rows.Scan(&item.ID, &item.GymID, &item.Kind, &item.URL, &item.Alt, &metadataJSON, &item.CreatedAt); err != nil {
			return nil, err
		}
		item.Metadata = map[string]any{}
		_ = json.Unmarshal(metadataJSON, &item.Metadata)
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) UpsertMediaFile(ctx context.Context, input MediaFileUpsertInput) (MediaFileRecord, error) {
	metadataJSON, err := json.Marshal(defaultMap(input.Metadata))
	if err != nil {
		return MediaFileRecord{}, err
	}
	if strings.TrimSpace(input.Kind) == "" {
		input.Kind = "image"
	}
	var id string
	if err := s.pool.QueryRow(ctx, `
		INSERT INTO media_files (gym_id, kind, url, alt, metadata)
		VALUES (NULLIF($1, '')::uuid, $2, $3, $4, $5::jsonb)
		RETURNING id::text`, input.GymID, input.Kind, input.URL, input.Alt, string(metadataJSON)).Scan(&id); err != nil {
		return MediaFileRecord{}, err
	}
	return s.GetMediaFileByID(ctx, id)
}

func (s *Store) GetMediaFileByID(ctx context.Context, id string) (MediaFileRecord, error) {
	var item MediaFileRecord
	var metadataJSON []byte
	err := s.pool.QueryRow(ctx, `
		SELECT id::text, COALESCE(gym_id::text, ''), kind, url, alt, metadata, created_at
		FROM media_files
		WHERE id = $1::uuid`, id).Scan(&item.ID, &item.GymID, &item.Kind, &item.URL, &item.Alt, &metadataJSON, &item.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return MediaFileRecord{}, ErrNoRows
		}
		return MediaFileRecord{}, err
	}
	item.Metadata = map[string]any{}
	_ = json.Unmarshal(metadataJSON, &item.Metadata)
	return item, nil
}

func (s *Store) DeleteMediaFile(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM media_files WHERE id = $1::uuid`, id)
	return err
}

func (s *Store) QuotePricing(ctx context.Context, planCode, gymID, couponCode, billingCycle string) (PricingQuote, error) {
	if strings.TrimSpace(planCode) == "" {
		return PricingQuote{}, errors.New("plan code is required")
	}
	if strings.TrimSpace(billingCycle) == "" {
		billingCycle = "monthly"
	}

	var plan PricingPlan
	var limitsJSON []byte
	if err := s.pool.QueryRow(ctx, `
		SELECT code, name, COALESCE(monthly_price, 0), COALESCE(yearly_price, 0), COALESCE(currency, 'USD'), COALESCE(description, ''), limits, is_active
		FROM pricing_plans
		WHERE code = $1 AND is_active = true
		LIMIT 1`, planCode).Scan(&plan.Code, &plan.Name, &plan.MonthlyPrice, &plan.YearlyPrice, &plan.Currency, &plan.Description, &limitsJSON, &plan.IsActive); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return PricingQuote{}, ErrNoRows
		}
		return PricingQuote{}, err
	}
	basePrice := plan.MonthlyPrice
	if strings.EqualFold(billingCycle, "yearly") && plan.YearlyPrice > 0 {
		basePrice = plan.YearlyPrice
	}
	var customerDiscountAmount float64
	var customerDiscountLabel string
	var customerDiscountStackable bool = true
	if strings.TrimSpace(gymID) != "" {
		var discountType string
		var discountValue float64
		var stackable bool
		var endsAt sql.NullTime
		err := s.pool.QueryRow(ctx, `
			SELECT discount_type, discount_value, stackable, ends_at
			FROM customer_discounts
			WHERE gym_id = $1::uuid
			  AND plan_code = $2
			  AND is_active = true
			  AND starts_at <= now()
			  AND (ends_at IS NULL OR ends_at >= now())
			ORDER BY created_at DESC
			LIMIT 1`, gymID, planCode).Scan(&discountType, &discountValue, &stackable, &endsAt)
		if err != nil && !errors.Is(err, pgx.ErrNoRows) {
			return PricingQuote{}, err
		}
		if err == nil {
			customerDiscountAmount = computeDiscount(basePrice, discountType, discountValue)
			customerDiscountLabel = "customer discount"
			customerDiscountStackable = stackable
		}
	}

	priceAfterCustomer := basePrice - customerDiscountAmount
	if priceAfterCustomer < 0 {
		priceAfterCustomer = 0
	}

	var couponDiscountAmount float64
	var appliedCouponCode string
	if strings.TrimSpace(couponCode) != "" {
		var coupon Coupon
		var startsAt, endsAt sql.NullTime
		err := s.pool.QueryRow(ctx, `
			SELECT code, discount_type, discount_value, COALESCE(applicable_plan_code, ''), COALESCE(panel_type, ''), first_purchase_only, usage_limit, usage_per_customer, stackable, COALESCE(description, ''), COALESCE(internal_note, ''), is_active, starts_at, ends_at
			FROM coupons
			WHERE code = $1 AND is_active = true
			LIMIT 1`, strings.TrimSpace(strings.ToUpper(couponCode))).Scan(&coupon.Code, &coupon.DiscountType, &coupon.DiscountValue, &coupon.ApplicablePlanCode, &coupon.PanelType, &coupon.FirstPurchaseOnly, &coupon.UsageLimit, &coupon.UsagePerCustomer, &coupon.Stackable, &coupon.Description, &coupon.InternalNote, &coupon.IsActive, &startsAt, &endsAt)
		if err != nil && !errors.Is(err, pgx.ErrNoRows) {
			return PricingQuote{}, err
		}
		if err == nil {
			if coupon.ApplicablePlanCode != "" && !strings.EqualFold(coupon.ApplicablePlanCode, planCode) {
				return PricingQuote{}, errors.New("coupon is not valid for this plan")
			}
			if !coupon.Stackable && !customerDiscountStackable {
				// If both are exclusive, prioritize the customer discount.
				couponDiscountAmount = 0
			} else {
				couponDiscountAmount = computeDiscount(priceAfterCustomer, coupon.DiscountType, coupon.DiscountValue)
			}
			appliedCouponCode = coupon.Code
		}
	}

	finalPrice := priceAfterCustomer - couponDiscountAmount
	if finalPrice < 0 {
		finalPrice = 0
	}

	return PricingQuote{
		PlanCode:            planCode,
		BillingCycle:        billingCycle,
		Currency:            plan.Currency,
		BasePrice:           basePrice,
		CustomerDiscount:    customerDiscountAmount,
		CouponDiscount:      couponDiscountAmount,
		FinalPrice:          finalPrice,
		DiscountedByCoupon:  couponDiscountAmount > 0,
		AppliedCouponCode:   appliedCouponCode,
		AppliedDiscountName: customerDiscountLabel,
	}, nil
}

func computeDiscount(base float64, discountType string, discountValue float64) float64 {
	switch strings.ToLower(strings.TrimSpace(discountType)) {
	case "fixed", "amount":
		if discountValue < 0 {
			return 0
		}
		return minFloat(base, discountValue)
	default:
		if discountValue <= 0 {
			return 0
		}
		return base * (discountValue / 100)
	}
}

func generateDemoPassword() string {
	var buf [6]byte
	_, _ = rand.Read(buf[:])
	return "Demo#" + strings.ToUpper(hex.EncodeToString(buf[:]))
}

func defaultMap(values map[string]any) map[string]any {
	if values == nil {
		return map[string]any{}
	}
	return values
}

func maxInt(value, fallback int) int {
	if value <= 0 {
		return fallback
	}
	return value
}

func minFloat(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
