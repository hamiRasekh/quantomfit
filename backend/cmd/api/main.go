package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"quantomfit/backend/internal/bootstrap"
	"quantomfit/backend/internal/config"
	"quantomfit/backend/internal/logging"
	dbinfra "quantomfit/backend/internal/infrastructure/db"
)

func main() {
	cfg := config.Load()
	logger := logging.New(cfg.Env)
	startedAt := time.Now().UTC()

	if err := dbinfra.NewMigrator(cfg.DatabaseURL(), "./migrations", "./seeders").Run(context.Background()); err != nil {
		logger.Fatal().Err(err).Msg("database migrations failed")
	}

	pool, err := dbinfra.OpenPool(context.Background(), cfg.DatabaseURL())
	if err != nil {
		logger.Fatal().Err(err).Msg("open database pool")
	}
	defer pool.Close()

	store := dbinfra.NewStore(pool)
	if cfg.Env != "production" {
		if err := store.SyncDemoCredentials(context.Background()); err != nil {
			logger.Fatal().Err(err).Msg("sync demo credentials")
		}
	}

	container := bootstrap.New(cfg, startedAt, store)

	srv := &http.Server{
		Addr:              cfg.HTTP.Addr,
		Handler:           container.Server.Handler(),
		ReadTimeout:        cfg.HTTP.ReadTimeout,
		WriteTimeout:       cfg.HTTP.WriteTimeout,
		IdleTimeout:        cfg.HTTP.IdleTimeout,
		ReadHeaderTimeout:  5 * time.Second,
	}

	go func() {
		logger.Info().Str("addr", cfg.HTTP.Addr).Msg("api listening")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal().Err(err).Msg("listen and serve")
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Error().Err(err).Msg("shutdown error")
	}
}
