package server

import (
	"net/http"
	"time"

	apphealth "quantomfit/backend/internal/app/health"
	appauth "quantomfit/backend/internal/app/auth"
	apppanel "quantomfit/backend/internal/app/panel"
	"quantomfit/backend/internal/config"
	"quantomfit/backend/internal/infrastructure/db"
	"quantomfit/backend/internal/transport/httpapi"
)

type Server struct {
	router http.Handler
}

func New(cfg config.Config, health *apphealth.Service, panel *apppanel.Service, authService *appauth.Service, store *db.Store) *Server {
	return &Server{
		router: httpapi.NewRouter(cfg, health, panel, authService, store, func() time.Time {
			return time.Now().UTC()
		}),
	}
}

func (s *Server) Handler() http.Handler {
	return s.router
}
