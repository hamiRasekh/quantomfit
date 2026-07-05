package httpapi

import (
	"net/http"
	"time"

	appauth "quantomfit/backend/internal/app/auth"
	apphealth "quantomfit/backend/internal/app/health"
	apppanel "quantomfit/backend/internal/app/panel"
	"quantomfit/backend/internal/config"
	"quantomfit/backend/internal/infrastructure/db"
	"quantomfit/backend/internal/platform/security"
	"quantomfit/backend/internal/platform/tenantresolver"
	"quantomfit/backend/internal/transport/httpapi/handlers"
	httpmiddleware "quantomfit/backend/internal/transport/httpapi/middleware"
	"quantomfit/backend/internal/transport/httpapi/response"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type nowFunc func() time.Time

func NewRouter(cfg config.Config, health *apphealth.Service, panel *apppanel.Service, authService *appauth.Service, store *db.Store, now nowFunc) http.Handler {
	r := chi.NewRouter()
	resolver := tenantresolver.New(store)
	jwtManager := security.NewJWTManager(cfg.JWTSecret)
	h := handlers.New(health, panel, authService, store)

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.NoCache)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.HTTP.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	r.Use(httpmiddleware.TenantResolver(resolver))
	r.Use(httpmiddleware.Authenticator(jwtManager))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		response.JSON(w, http.StatusOK, map[string]any{
			"service": cfg.AppName,
			"version": cfg.AppVersion,
			"env":     cfg.Env,
			"builtAt": cfg.BuiltAt,
			"now":     now().UTC(),
		})
	})

	r.Get("/healthz", h.Health)

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", h.Health)
		r.Get("/platform", h.Platform)
		r.Get("/plans", h.Plans)
		r.Get("/coupons", h.Coupons)
		r.Get("/public/pricing", h.PublicPricing)
		r.Get("/public/website-content", h.PublicWebsiteContent)
		r.Get("/public/gyms", h.PublicGyms)
		r.Get("/public/gyms/{slug}", h.PublicGymBySlug)
		r.Post("/public/demo-request", h.PublicDemoRequest)
		r.Get("/public/pricing/quote", h.PublicPricing)
		r.Post("/auth/login", h.Login)
		r.Post("/auth/refresh", h.Refresh)
		r.Post("/auth/logout", h.Logout)
		r.Get("/auth/me", h.Me)
		r.Get("/onboarding/state", h.OnboardingState)
		r.Put("/onboarding/state", h.UpdateOnboardingState)
		r.Get("/dashboard", h.Dashboard)
		r.Get("/occupancy/current", h.OccupancyCurrent)
		r.Get("/occupancy/stream", h.OccupancyStream)
		r.Get("/attendance", h.AttendanceList)
		r.Route("/members", func(r chi.Router) {
			r.Get("/", h.MembersList)
			r.Post("/", h.CreateMember)
			r.Get("/{memberID}", h.MemberDetail)
			r.Patch("/{memberID}", h.UpdateMember)
			r.Delete("/{memberID}", h.DeleteMember)
			r.Post("/{memberID}/program", h.AssignMemberProgram)
		})
		r.Route("/trainers", func(r chi.Router) {
			r.Get("/", h.TrainersList)
			r.Post("/", h.CreateTrainer)
			r.Get("/{trainerID}", h.TrainerDetail)
			r.Patch("/{trainerID}", h.UpdateTrainer)
			r.Delete("/{trainerID}", h.DeleteTrainer)
		})
		r.Route("/programs", func(r chi.Router) {
			r.Get("/", h.ProgramsList)
			r.Get("/current", h.CurrentProgram)
			r.Post("/", h.CreateProgram)
			r.Get("/{programID}", h.ProgramDetail)
			r.Patch("/{programID}", h.UpdateProgram)
			r.Get("/{programID}/sessions", h.ProgramSessions)
			r.Post("/{programID}/sessions", h.CreateProgramSession)
		})
		r.Get("/sessions", h.SessionsList)
		r.Patch("/sessions/{sessionID}", h.UpdateSession)
		r.Post("/sessions/{sessionID}/complete", h.CompleteSession)
		r.Get("/analytics/dashboard", h.AnalyticsDashboard)
		r.Get("/gym/subscription", h.Subscriptions)
		r.Route("/equipment", func(r chi.Router) {
			r.Get("/", h.EquipmentList)
			r.Post("/", h.CreateEquipment)
			r.Patch("/{equipmentID}", h.UpdateEquipment)
			r.Delete("/{equipmentID}", h.DeleteEquipment)
		})
		r.Route("/classes", func(r chi.Router) {
			r.Get("/", h.ClassesList)
			r.Post("/", h.CreateClass)
			r.Patch("/{classID}", h.UpdateClass)
			r.Delete("/{classID}", h.DeleteClass)
		})
		r.Route("/sms-automations", func(r chi.Router) {
			r.Get("/", h.SMSAutomationRules)
			r.Post("/", h.SMSAutomationRules)
			r.Patch("/{ruleID}", h.SMSAutomationRuleByID)
			r.Delete("/{ruleID}", h.SMSAutomationRuleByID)
		})
		r.Get("/sms/logs", h.SMSAutomationLogs)

		r.Route("/admin", func(r chi.Router) {
			r.Get("/dashboard", h.AdminDashboard)
			r.Post("/gyms", h.CreateGym)
			r.Get("/gyms", h.ListGyms)
			r.Patch("/gyms/*", h.UpdateGym)
			r.Delete("/gyms/*", h.DeleteGym)
			r.Get("/users", h.AdminUsers)
			r.Patch("/users/*", h.AdminUserByID)
			r.Get("/content", h.WebsiteContent)
			r.Patch("/content", h.WebsiteContent)
			r.Post("/plans", h.CreatePlan)
			r.Patch("/plans/*", h.UpdatePlan)
			r.Delete("/plans/*", h.DeletePlan)
			r.Post("/coupons", h.CreateCoupon)
			r.Patch("/coupons/*", h.UpdateCoupon)
			r.Delete("/coupons/*", h.DeleteCoupon)
			r.Route("/customer-discounts", func(r chi.Router) {
				r.Get("/", h.CustomerDiscounts)
				r.Post("/", h.CustomerDiscounts)
				r.Delete("/*", h.CustomerDiscountByID)
			})
			r.Route("/demo-accounts", func(r chi.Router) {
				r.Get("/", h.DemoAccesses)
				r.Post("/", h.DemoAccesses)
				r.Delete("/*", h.DemoAccessByID)
			})
			r.Route("/demo-requests", func(r chi.Router) {
				r.Get("/", h.DemoRequests)
				r.Patch("/{id}", h.DemoRequests)
			})
			r.Route("/media", func(r chi.Router) {
				r.Get("/", h.MediaFiles)
				r.Post("/", h.MediaFiles)
				r.Delete("/*", h.MediaFileByID)
			})
		})
	})

	return r
}
