package bootstrap

import (
	"time"

	appauth "quantomfit/backend/internal/app/auth"
	apphealth "quantomfit/backend/internal/app/health"
	apppanel "quantomfit/backend/internal/app/panel"
	"quantomfit/backend/internal/config"
	dbinfra "quantomfit/backend/internal/infrastructure/db"
	"quantomfit/backend/internal/server"
)

type Container struct {
	Config    config.Config
	StartedAt time.Time
	Auth      *appauth.Service
	Panel     *apppanel.Service
	Health    *apphealth.Service
	Server    *server.Server
	Store     *dbinfra.Store
}

func New(cfg config.Config, startedAt time.Time, store *dbinfra.Store) *Container {
	healthService := apphealth.NewService(startedAt)
	panelsService := apppanel.NewService(store, cfg.AppName, cfg.AppVersion, cfg.Env, cfg.BuiltAt, startedAt)
	authService := appauth.NewService(cfg.JWTSecret, store)

	return &Container{
		Config:    cfg,
		StartedAt: startedAt,
		Auth:      authService,
		Panel:     panelsService,
		Health:    healthService,
		Store:     store,
		Server:    server.New(cfg, healthService, panelsService, authService, store),
	}
}
