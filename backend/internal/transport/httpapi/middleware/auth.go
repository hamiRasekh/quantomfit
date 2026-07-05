package middleware

import (
	"net/http"

	"quantomfit/backend/internal/platform/requestcontext"
	"quantomfit/backend/internal/platform/security"
)

func Authenticator(manager *security.JWTManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := r.Header.Get("Authorization")
			if token == "" {
				next.ServeHTTP(w, r)
				return
			}

			claims, err := manager.Parse(token)
			if err == nil {
				ctx := requestcontext.WithClaims(r.Context(), claims)
				r = r.WithContext(ctx)
			}

			next.ServeHTTP(w, r)
		})
	}
}

