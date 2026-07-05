package db

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

func (s *Store) SetUserStatus(ctx context.Context, userID, status string) (AdminUserRecord, error) {
	status = strings.TrimSpace(status)
	if status == "" {
		return AdminUserRecord{}, errors.New("status is required")
	}
	if _, err := s.pool.Exec(ctx, `UPDATE users SET status = $2, updated_at = now() WHERE id = $1::uuid`, userID, status); err != nil {
		return AdminUserRecord{}, err
	}
	users, err := s.ListUsers(ctx)
	if err != nil {
		return AdminUserRecord{}, err
	}
	for _, user := range users {
		if user.ID == userID {
			return user, nil
		}
	}
	return AdminUserRecord{}, ErrNoRows
}

func (s *Store) ResetUserPassword(ctx context.Context, userID, password string) error {
	password = strings.TrimSpace(password)
	if password == "" {
		return errors.New("password is required")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = s.pool.Exec(ctx, `UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1::uuid`, userID, string(hash))
	return err
}

func (s *Store) GetUserByID(ctx context.Context, userID string) (AdminUserRecord, error) {
	var item AdminUserRecord
	var lastLogin sql.NullTime
	err := s.pool.QueryRow(ctx, `
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
		WHERE u.id = $1::uuid
		LIMIT 1`, userID).Scan(&item.ID, &item.Email, &item.Phone, &item.Role, &item.Status, &item.GymName, &item.GymSlug, &lastLogin)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return AdminUserRecord{}, ErrNoRows
		}
		return AdminUserRecord{}, err
	}
	if lastLogin.Valid {
		value := lastLogin.Time.UTC()
		item.LastLoginAt = &value
	}
	return item, nil
}
