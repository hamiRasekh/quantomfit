package auth

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"

	domainauth "quantomfit/backend/internal/domain/auth"
	"quantomfit/backend/internal/infrastructure/db"
	"quantomfit/backend/internal/platform/security"
)

type Service struct {
	secret string
	store  *db.Store
}

func NewService(secret string, store *db.Store) *Service {
	return &Service{secret: secret, store: store}
}

type Session struct {
	AccessToken  string               `json:"accessToken"`
	RefreshToken string               `json:"refreshToken"`
	Claims       domainauth.Claims    `json:"claims"`
	ExpiresAt    time.Time            `json:"expiresAt"`
	RefreshExpiresAt time.Time        `json:"refreshExpiresAt"`
}

func (s *Service) MintSession(claims domainauth.Claims) (Session, error) {
	accessExpires := time.Now().UTC().Add(15 * time.Minute)
	refreshExpires := time.Now().UTC().Add(30 * 24 * time.Hour)

	accessToken, err := s.mintToken(claims, accessExpires, "access")
	if err != nil {
		return Session{}, err
	}

	refreshToken, err := s.mintToken(claims, refreshExpires, "refresh")
	if err != nil {
		return Session{}, err
	}

	return Session{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		Claims:       claims,
		ExpiresAt:    accessExpires,
		RefreshExpiresAt: refreshExpires,
	}, nil
}

func (s *Service) Login(ctx context.Context, tenantID, email, password string) (Session, error) {
	claims, err := s.store.AuthenticateUser(ctx, tenantID, email, password)
	if err != nil {
		return Session{}, err
	}
	session, err := s.MintSession(claims)
	if err != nil {
		return Session{}, err
	}
	if claims.TenantID != "platform" {
		if err := s.store.SaveRefreshToken(ctx, claims.UserID, claims.TenantID, session.RefreshToken, session.RefreshExpiresAt); err != nil {
			return Session{}, err
		}
	}
	return session, nil
}

func (s *Service) Refresh(ctx context.Context, refreshToken string) (Session, error) {
	claims, tokenUse, err := securityParseClaims(s.secret, refreshToken)
	if err != nil {
		return Session{}, err
	}
	if tokenUse != "refresh" {
		return Session{}, errors.New("invalid refresh token")
	}
	if claims.TenantID != "platform" {
		exists, err := s.store.RefreshTokenExists(ctx, refreshToken)
		if err != nil {
			return Session{}, err
		}
		if !exists {
			return Session{}, errors.New("refresh token not found")
		}
		if err := s.store.RevokeRefreshToken(ctx, refreshToken); err != nil {
			return Session{}, err
		}
	}
	session, err := s.MintSession(claims)
	if err != nil {
		return Session{}, err
	}
	if claims.TenantID != "platform" {
		if err := s.store.SaveRefreshToken(ctx, claims.UserID, claims.TenantID, session.RefreshToken, session.RefreshExpiresAt); err != nil {
			return Session{}, err
		}
	}
	return session, nil
}

func (s *Service) Logout(ctx context.Context, refreshToken string) error {
	claims, tokenUse, err := securityParseClaims(s.secret, refreshToken)
	if err != nil {
		return err
	}
	if tokenUse != "refresh" {
		return errors.New("invalid refresh token")
	}
	if claims.TenantID == "platform" {
		return nil
	}
	return s.store.RevokeRefreshToken(ctx, refreshToken)
}

func (s *Service) mintToken(claims domainauth.Claims, expiresAt time.Time, tokenUse string) (string, error) {
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   claims.UserID,
		"tid":   claims.TenantID,
		"role":  claims.Role,
		"panel": claims.Panel,
		"sid":   claims.SessionID,
		"typ":   tokenUse,
		"iat":   time.Now().UTC().Unix(),
		"exp":   expiresAt.Unix(),
		"iss":   "quantumfit-auth",
		"aud":   "quantumfit-web",
	})
	return tok.SignedString([]byte(s.secret))
}

func securityParseClaims(secret, tokenString string) (domainauth.Claims, string, error) {
	manager := security.NewJWTManager(secret)
	claims, tokenUse, err := manager.ParseDetailed(tokenString)
	return claims, tokenUse, err
}
