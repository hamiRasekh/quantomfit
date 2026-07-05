package tenantresolver

import (
	"net/http"
	"strings"
	"time"

	"quantomfit/backend/internal/domain/tenant"
	"quantomfit/backend/internal/infrastructure/db"
	"quantomfit/backend/internal/platform/requestcontext"
)

type Resolver struct {
	platformTenant tenant.Tenant
	store          *db.Store
}

func New(store *db.Store) *Resolver {
	now := time.Now().UTC()
	return &Resolver{
		platformTenant: tenant.Tenant{
			ID:        "platform",
			Slug:      "platform",
			Name:      "QuantumFit Platform",
			Subdomain: "admin",
			PanelType: tenant.PanelAdmin,
			Status:    tenant.StatusActive,
			CreatedAt: now,
			UpdatedAt: now,
		},
		store: store,
	}
}

func (r *Resolver) Resolve(req *http.Request) tenant.Tenant {
	host := strings.ToLower(req.Host)
	if i := strings.Index(host, ":"); i >= 0 {
		host = host[:i]
	}

	panel := strings.ToLower(strings.TrimSpace(req.Header.Get("X-Panel-Context")))
	subdomain := strings.ToLower(strings.TrimSpace(req.Header.Get("X-Tenant-Subdomain")))

	if panel == "admin" || strings.HasPrefix(host, "admin.") {
		return r.platformTenant
	}

	if panel == "marketing" || strings.HasPrefix(host, "www.") {
		now := time.Now().UTC()
		return tenant.Tenant{
			ID:        "marketing",
			Slug:      "marketing",
			Name:      "QuantumFit",
			Subdomain: "www",
			PanelType: tenant.PanelMarketing,
			Status:    tenant.StatusActive,
			CreatedAt: now,
			UpdatedAt: now,
		}
	}

	if subdomain == "" {
		switch {
		case strings.HasPrefix(host, "gym."):
			subdomain = "gym"
		case strings.HasPrefix(host, "coach."):
			subdomain = "coach"
		case strings.HasPrefix(host, "app."):
			subdomain = "app"
		default:
			subdomain = "gym"
		}
	}

	if r.store != nil {
		if item, err := r.store.ResolveTenant(req.Context(), subdomain); err == nil {
			return item
		}
	}

	switch {
	case subdomain == "coach":
		return tenant.Tenant{ID: "demo-gym", Slug: "demo-gym", Name: "Demo Gym", Subdomain: "coach", PanelType: tenant.PanelCoach, Status: tenant.StatusActive}
	case subdomain == "app":
		return tenant.Tenant{ID: "demo-gym", Slug: "demo-gym", Name: "Demo Gym", Subdomain: "app", PanelType: tenant.PanelAthlete, Status: tenant.StatusActive}
	default:
		now := time.Now().UTC()
		return tenant.Tenant{
			ID:        "demo-gym",
			Slug:      "demo-gym",
			Name:      "Demo Gym",
			Subdomain: "gym",
			PanelType: tenant.PanelGym,
			Status:    tenant.StatusActive,
			CreatedAt: now,
			UpdatedAt: now,
		}
	}
}

func (r *Resolver) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		ctx := requestcontext.WithTenant(req.Context(), r.Resolve(req))
		next.ServeHTTP(w, req.WithContext(ctx))
	})
}
