package middleware

import (
	"net/http"

	"quantomfit/backend/internal/platform/tenantresolver"
)

func TenantResolver(resolver *tenantresolver.Resolver) func(http.Handler) http.Handler {
	return resolver.Middleware
}

