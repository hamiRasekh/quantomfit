package db

import (
	"context"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type demoCredential struct {
	Email      string
	Password   string
	TenantSlug string
	Role       string
}

// SyncDemoCredentials keeps the local demo accounts usable even when the seed journal
// has already been applied on an existing database.
func (s *Store) SyncDemoCredentials(ctx context.Context) error {
	accounts := []demoCredential{
		{Email: "admin@quantumfit.ir", Password: "Admin#2026"},
		{Email: "superadmin@quantumfit.ir", Password: "SuperAdmin#2026"},
		{Email: "owner@demo-gym.ir", Password: "Owner#2026", TenantSlug: "demo-gym", Role: "gym_owner"},
		{Email: "club-owner@demo-gym.ir", Password: "Club#2026", TenantSlug: "demo-gym", Role: "gym_owner"},
		{Email: "trainer@demo-gym.ir", Password: "Trainer#2026", TenantSlug: "demo-gym", Role: "trainer"},
		{Email: "athlete@demo-gym.ir", Password: "Athlete#2026", TenantSlug: "demo-gym", Role: "athlete"},
	}

	for _, account := range accounts {
		if err := s.upsertDemoUser(ctx, account.Email, account.Password); err != nil {
			return err
		}
		if err := s.ensureDemoGymAssignment(ctx, account.Email, account.TenantSlug, account.Role); err != nil {
			return err
		}
	}

	return nil
}

func (s *Store) upsertDemoUser(ctx context.Context, email, password string) error {
	email = strings.TrimSpace(strings.ToLower(email))
	password = strings.TrimSpace(password)
	if email == "" || password == "" {
		return nil
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = s.pool.Exec(ctx, `
		INSERT INTO users (email, phone, password_hash, status)
		VALUES ($1, NULL, $2, 'active')
		ON CONFLICT (email) DO UPDATE SET
			password_hash = EXCLUDED.password_hash,
			status = 'active',
			updated_at = now()`,
		email, string(hash))
	return err
}

func (s *Store) ensureDemoGymAssignment(ctx context.Context, email, tenantSlug, role string) error {
	email = strings.TrimSpace(strings.ToLower(email))
	tenantSlug = strings.TrimSpace(strings.ToLower(tenantSlug))
	role = strings.TrimSpace(strings.ToLower(role))
	if email == "" || tenantSlug == "" || role == "" {
		return nil
	}

	_, err := s.pool.Exec(ctx, `
		WITH target_gym AS (
			SELECT id
			FROM gyms
			WHERE slug = $2
			LIMIT 1
		),
		target_user AS (
			SELECT id
			FROM users
			WHERE lower(email) = $1
			LIMIT 1
		)
		INSERT INTO gym_users (tenant_id, user_id, role, status, first_login_completed_at)
		SELECT target_gym.id, target_user.id, $3, 'active', now()
		FROM target_gym
		CROSS JOIN target_user
		ON CONFLICT (tenant_id, user_id) DO UPDATE SET
			role = EXCLUDED.role,
			status = 'active'`,
		email, tenantSlug, role)
	return err
}
