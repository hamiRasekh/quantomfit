package requestcontext

import (
	"context"

	"quantomfit/backend/internal/domain/auth"
	"quantomfit/backend/internal/domain/tenant"
)

type contextKey string

const (
	tenantKey contextKey = "quantomfit.tenant"
	claimsKey contextKey = "quantomfit.claims"
)

func WithTenant(ctx context.Context, value tenant.Tenant) context.Context {
	return context.WithValue(ctx, tenantKey, value)
}

func TenantFrom(ctx context.Context) (tenant.Tenant, bool) {
	value, ok := ctx.Value(tenantKey).(tenant.Tenant)
	return value, ok
}

func WithClaims(ctx context.Context, value auth.Claims) context.Context {
	return context.WithValue(ctx, claimsKey, value)
}

func ClaimsFrom(ctx context.Context) (auth.Claims, bool) {
	value, ok := ctx.Value(claimsKey).(auth.Claims)
	return value, ok
}

