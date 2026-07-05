package db

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

type PublicGymProfile struct {
	Gym         GymRecord        `json:"gym"`
	Onboarding  OnboardingState  `json:"onboarding"`
	Equipment   []EquipmentItem  `json:"equipment"`
	Trainers    []TrainerItem    `json:"trainers"`
	Classes     []GymClassRecord `json:"classes"`
}

type MemberUpsertInput struct {
	ExternalRef string `json:"externalRef"`
	FullName    string `json:"fullName"`
	Phone       string `json:"phone"`
	Gender      string `json:"gender"`
	Status      string `json:"status"`
}

type TrainerUpsertInput struct {
	UserID     string `json:"userId"`
	FullName   string `json:"fullName"`
	Specialty  string `json:"specialty"`
	Status     string `json:"status"`
}

type EquipmentUpsertInput struct {
	Name             string `json:"name"`
	Category         string `json:"category"`
	Quantity         int    `json:"quantity"`
	Status           string `json:"status"`
}

type GymClassRecord struct {
	ID        string     `json:"id"`
	TrainerID string     `json:"trainerId,omitempty"`
	Title     string     `json:"title"`
	Capacity  int        `json:"capacity"`
	Schedule  string     `json:"schedule"`
	Status    string     `json:"status"`
	CreatedAt string     `json:"createdAt"`
	UpdatedAt string     `json:"updatedAt"`
}

type GymClassUpsertInput struct {
	TrainerID string `json:"trainerId"`
	Title     string `json:"title"`
	Capacity  int    `json:"capacity"`
	Schedule  string `json:"schedule"`
	Status    string `json:"status"`
}

func (s *Store) CreateMember(ctx context.Context, tenantID string, input MemberUpsertInput) (MemberDetail, error) {
	if strings.TrimSpace(input.FullName) == "" {
		return MemberDetail{}, errors.New("member name is required")
	}
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "active"
	}
	var memberID string
	if err := s.pool.QueryRow(ctx, `
		INSERT INTO members (tenant_id, external_ref, full_name, phone, gender, status, joined_at)
		VALUES ($1::uuid, NULLIF($2, ''), $3, NULLIF($4, ''), NULLIF($5, ''), $6, now())
		RETURNING id::text`,
		tenantID, input.ExternalRef, input.FullName, input.Phone, input.Gender, status).Scan(&memberID); err != nil {
		return MemberDetail{}, err
	}
	return s.GetMemberByID(ctx, tenantID, memberID)
}

func (s *Store) UpdateMember(ctx context.Context, tenantID, memberID string, input MemberUpsertInput) (MemberDetail, error) {
	if _, err := s.pool.Exec(ctx, `
		UPDATE members
		SET external_ref = COALESCE(NULLIF($3, ''), external_ref),
		    full_name = COALESCE(NULLIF($4, ''), full_name),
		    phone = COALESCE(NULLIF($5, ''), phone),
		    gender = COALESCE(NULLIF($6, ''), gender),
		    status = COALESCE(NULLIF($7, ''), status),
		    updated_at = now()
		WHERE tenant_id = $1::uuid AND id = $2::uuid`,
		tenantID, memberID, input.ExternalRef, input.FullName, input.Phone, input.Gender, input.Status); err != nil {
		return MemberDetail{}, err
	}
	return s.GetMemberByID(ctx, tenantID, memberID)
}

func (s *Store) DeleteMember(ctx context.Context, tenantID, memberID string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM members WHERE tenant_id = $1::uuid AND id = $2::uuid`, tenantID, memberID)
	return err
}

func (s *Store) CreateTrainer(ctx context.Context, tenantID string, input TrainerUpsertInput) (TrainerItem, error) {
	if strings.TrimSpace(input.FullName) == "" {
		return TrainerItem{}, errors.New("trainer name is required")
	}
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "active"
	}
	var trainerID string
	if err := s.pool.QueryRow(ctx, `
		INSERT INTO trainers (tenant_id, user_id, full_name, specialty, status)
		VALUES ($1::uuid, NULLIF($2, '')::uuid, $3, NULLIF($4, ''), $5)
		RETURNING id::text`,
		tenantID, input.UserID, input.FullName, input.Specialty, status).Scan(&trainerID); err != nil {
		return TrainerItem{}, err
	}
	return s.GetTrainerByID(ctx, tenantID, trainerID)
}

func (s *Store) UpdateTrainer(ctx context.Context, tenantID, trainerID string, input TrainerUpsertInput) (TrainerItem, error) {
	if _, err := s.pool.Exec(ctx, `
		UPDATE trainers
		SET user_id = CASE WHEN $3 = '' THEN user_id ELSE $3::uuid END,
		    full_name = COALESCE(NULLIF($4, ''), full_name),
		    specialty = COALESCE(NULLIF($5, ''), specialty),
		    status = COALESCE(NULLIF($6, ''), status),
		    updated_at = now()
		WHERE tenant_id = $1::uuid AND id = $2::uuid`,
		tenantID, trainerID, input.UserID, input.FullName, input.Specialty, input.Status); err != nil {
		return TrainerItem{}, err
	}
	return s.GetTrainerByID(ctx, tenantID, trainerID)
}

func (s *Store) DeleteTrainer(ctx context.Context, tenantID, trainerID string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM trainers WHERE tenant_id = $1::uuid AND id = $2::uuid`, tenantID, trainerID)
	return err
}

func (s *Store) GetTrainerByID(ctx context.Context, tenantID, trainerID string) (TrainerItem, error) {
	var item TrainerItem
	var createdAt sql.NullTime
	err := s.pool.QueryRow(ctx, `
		SELECT id::text, full_name, COALESCE(specialty, ''), status, created_at
		FROM trainers
		WHERE tenant_id = $1::uuid AND id = $2::uuid
		LIMIT 1`, tenantID, trainerID).Scan(&item.ID, &item.FullName, &item.Specialty, &item.Status, &createdAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return TrainerItem{}, ErrNoRows
		}
		return TrainerItem{}, err
	}
	if createdAt.Valid {
		value := createdAt.Time.UTC()
		item.CreatedAt = &value
	}
	return item, nil
}

func (s *Store) CreateEquipment(ctx context.Context, tenantID string, input EquipmentUpsertInput) (EquipmentItem, error) {
	if strings.TrimSpace(input.Name) == "" {
		return EquipmentItem{}, errors.New("equipment name is required")
	}
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "active"
	}
	if input.Quantity <= 0 {
		input.Quantity = 1
	}
	var equipmentID string
	if err := s.pool.QueryRow(ctx, `
		INSERT INTO equipment (tenant_id, name, category, quantity, status)
		VALUES ($1::uuid, $2, NULLIF($3, ''), $4, $5)
		RETURNING id::text`,
		tenantID, input.Name, input.Category, input.Quantity, status).Scan(&equipmentID); err != nil {
		return EquipmentItem{}, err
	}
	return s.GetEquipmentByID(ctx, tenantID, equipmentID)
}

func (s *Store) UpdateEquipment(ctx context.Context, tenantID, equipmentID string, input EquipmentUpsertInput) (EquipmentItem, error) {
	if _, err := s.pool.Exec(ctx, `
		UPDATE equipment
		SET name = COALESCE(NULLIF($3, ''), name),
		    category = COALESCE(NULLIF($4, ''), category),
		    quantity = CASE WHEN $5 <= 0 THEN quantity ELSE $5 END,
		    status = COALESCE(NULLIF($6, ''), status),
		    updated_at = now()
		WHERE tenant_id = $1::uuid AND id = $2::uuid`,
		tenantID, equipmentID, input.Name, input.Category, input.Quantity, input.Status); err != nil {
		return EquipmentItem{}, err
	}
	return s.GetEquipmentByID(ctx, tenantID, equipmentID)
}

func (s *Store) DeleteEquipment(ctx context.Context, tenantID, equipmentID string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM equipment WHERE tenant_id = $1::uuid AND id = $2::uuid`, tenantID, equipmentID)
	return err
}

func (s *Store) GetEquipmentByID(ctx context.Context, tenantID, equipmentID string) (EquipmentItem, error) {
	var item EquipmentItem
	var lastMaintenance sql.NullTime
	err := s.pool.QueryRow(ctx, `
		SELECT id::text, name, COALESCE(category, ''), quantity, status, last_maintenance_at
		FROM equipment
		WHERE tenant_id = $1::uuid AND id = $2::uuid
		LIMIT 1`, tenantID, equipmentID).Scan(&item.ID, &item.Name, &item.Category, &item.Quantity, &item.Status, &lastMaintenance)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return EquipmentItem{}, ErrNoRows
		}
		return EquipmentItem{}, err
	}
	if lastMaintenance.Valid {
		value := lastMaintenance.Time.UTC()
		item.LastMaintenanceAt = &value
	}
	return item, nil
}

func (s *Store) ListClasses(ctx context.Context, tenantID string, limit int) ([]GymClassRecord, error) {
	if limit <= 0 || limit > 100 {
		limit = 24
	}
	rows, err := s.pool.Query(ctx, `
		SELECT id::text, COALESCE(trainer_id::text, ''), title, capacity, schedule, status, created_at, updated_at
		FROM gym_classes
		WHERE tenant_id = $1::uuid
		ORDER BY created_at DESC
		LIMIT $2`, tenantID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]GymClassRecord, 0)
	for rows.Next() {
		var item GymClassRecord
		var trainerID sql.NullString
		var createdAt, updatedAt sql.NullTime
		if err := rows.Scan(&item.ID, &trainerID, &item.Title, &item.Capacity, &item.Schedule, &item.Status, &createdAt, &updatedAt); err != nil {
			return nil, err
		}
		item.TrainerID = trainerID.String
		if createdAt.Valid {
			item.CreatedAt = createdAt.Time.UTC().Format(time.RFC3339)
		}
		if updatedAt.Valid {
			item.UpdatedAt = updatedAt.Time.UTC().Format(time.RFC3339)
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) GetClassByID(ctx context.Context, tenantID, classID string) (GymClassRecord, error) {
	var item GymClassRecord
	var trainerID sql.NullString
	var createdAt, updatedAt sql.NullTime
	err := s.pool.QueryRow(ctx, `
		SELECT id::text, COALESCE(trainer_id::text, ''), title, capacity, schedule, status, created_at, updated_at
		FROM gym_classes
		WHERE tenant_id = $1::uuid AND id = $2::uuid
		LIMIT 1`, tenantID, classID).Scan(&item.ID, &trainerID, &item.Title, &item.Capacity, &item.Schedule, &item.Status, &createdAt, &updatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return GymClassRecord{}, ErrNoRows
		}
		return GymClassRecord{}, err
	}
	item.TrainerID = trainerID.String
	if createdAt.Valid {
		item.CreatedAt = createdAt.Time.UTC().Format(time.RFC3339)
	}
	if updatedAt.Valid {
		item.UpdatedAt = updatedAt.Time.UTC().Format(time.RFC3339)
	}
	return item, nil
}

func (s *Store) GetGymBySlug(ctx context.Context, slug string) (GymRecord, error) {
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
		WHERE g.slug = $1
		LIMIT 1`, slug).Scan(
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

func (s *Store) PublicGyms(ctx context.Context) ([]GymRecord, error) {
	items, err := s.ListGyms(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]GymRecord, 0, len(items))
	for _, item := range items {
		if strings.EqualFold(item.Status, "active") {
			out = append(out, item)
		}
	}
	return out, nil
}

func (s *Store) PublicGymProfile(ctx context.Context, slug string) (PublicGymProfile, error) {
	gym, err := s.GetGymBySlug(ctx, slug)
	if err != nil {
		return PublicGymProfile{}, err
	}
	onboarding, err := s.OnboardingState(ctx, gym.ID)
	if err != nil {
		onboarding = OnboardingState{Status: "created", Step: "gym_name", Payload: map[string]any{}}
	}
	equipment, err := s.ListEquipment(ctx, gym.ID, 24)
	if err != nil {
		equipment = []EquipmentItem{}
	}
	trainers, err := s.ListTrainers(ctx, gym.ID, 24)
	if err != nil {
		trainers = []TrainerItem{}
	}
	classes, err := s.ListClasses(ctx, gym.ID, 24)
	if err != nil {
		classes = []GymClassRecord{}
	}
	return PublicGymProfile{
		Gym:       gym,
		Onboarding: onboarding,
		Equipment: equipment,
		Trainers:  trainers,
		Classes:   classes,
	}, nil
}

func (s *Store) CreateClass(ctx context.Context, tenantID string, input GymClassUpsertInput) (GymClassRecord, error) {
	if strings.TrimSpace(input.Title) == "" {
		return GymClassRecord{}, errors.New("class title is required")
	}
	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "active"
	}
	var classID string
	if err := s.pool.QueryRow(ctx, `
		INSERT INTO gym_classes (tenant_id, trainer_id, title, capacity, schedule, status)
		VALUES ($1::uuid, NULLIF($2, '')::uuid, $3, $4, $5, $6)
		RETURNING id::text`,
		tenantID, input.TrainerID, input.Title, maxInt(input.Capacity, 0), input.Schedule, status).Scan(&classID); err != nil {
		return GymClassRecord{}, err
	}
	return s.GetClassByID(ctx, tenantID, classID)
}

func (s *Store) UpdateClass(ctx context.Context, tenantID, classID string, input GymClassUpsertInput) (GymClassRecord, error) {
	if _, err := s.pool.Exec(ctx, `
		UPDATE gym_classes
		SET trainer_id = CASE WHEN $3 = '' THEN trainer_id ELSE $3::uuid END,
		    title = COALESCE(NULLIF($4, ''), title),
		    capacity = CASE WHEN $5 < 0 THEN capacity ELSE $5 END,
		    schedule = COALESCE(NULLIF($6, ''), schedule),
		    status = COALESCE(NULLIF($7, ''), status),
		    updated_at = now()
		WHERE tenant_id = $1::uuid AND id = $2::uuid`,
		tenantID, classID, input.TrainerID, input.Title, input.Capacity, input.Schedule, input.Status); err != nil {
		return GymClassRecord{}, err
	}
	return s.GetClassByID(ctx, tenantID, classID)
}

func (s *Store) DeleteClass(ctx context.Context, tenantID, classID string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM gym_classes WHERE tenant_id = $1::uuid AND id = $2::uuid`, tenantID, classID)
	return err
}
