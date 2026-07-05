package httpapi

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	appauth "quantomfit/backend/internal/app/auth"
	apphealth "quantomfit/backend/internal/app/health"
	apppanel "quantomfit/backend/internal/app/panel"
	"quantomfit/backend/internal/config"
)

func TestHealthz(t *testing.T) {
	cfg := config.Load()
	startedAt := time.Now().UTC().Add(-time.Minute)
	health := apphealth.NewService(startedAt)
	panel := apppanel.NewService(nil, cfg.AppName, cfg.AppVersion, cfg.Env, cfg.BuiltAt, startedAt)
	authService := appauth.NewService(cfg.JWTSecret, nil)

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rr := httptest.NewRecorder()

	NewRouter(cfg, health, panel, authService, nil, time.Now).ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
}
