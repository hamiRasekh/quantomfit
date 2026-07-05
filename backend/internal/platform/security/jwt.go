package security

import (
	"errors"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"quantomfit/backend/internal/domain/auth"
)

type JWTManager struct {
	secret []byte
}

func NewJWTManager(secret string) *JWTManager {
	return &JWTManager{secret: []byte(secret)}
}

type TokenClaims struct {
	UserID    string `json:"sub"`
	TenantID  string `json:"tid"`
	Role      string `json:"role"`
	Panel     string `json:"panel"`
	SessionID string `json:"sid"`
	TokenUse  string `json:"typ"`
	jwt.RegisteredClaims
}

func (m *JWTManager) Parse(tokenString string) (auth.Claims, error) {
	claims, _, err := m.ParseDetailed(tokenString)
	return claims, err
}

func (m *JWTManager) ParseDetailed(tokenString string) (auth.Claims, string, error) {
	tokenString = strings.TrimSpace(strings.TrimPrefix(tokenString, "Bearer "))
	if tokenString == "" {
		return auth.Claims{}, "", errors.New("empty token")
	}

	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (any, error) {
		return m.secret, nil
	})
	if err != nil {
		return auth.Claims{}, "", err
	}

	claims, ok := token.Claims.(*TokenClaims)
	if !ok || !token.Valid {
		return auth.Claims{}, "", errors.New("invalid token")
	}

	if claims.ExpiresAt != nil && claims.ExpiresAt.Time.Before(time.Now().UTC()) {
		return auth.Claims{}, "", errors.New("token expired")
	}

	return auth.Claims{
		UserID:    claims.UserID,
		TenantID:  claims.TenantID,
		Role:      auth.Role(claims.Role),
		Panel:     claims.Panel,
		SessionID: claims.SessionID,
	}, claims.TokenUse, nil
}
