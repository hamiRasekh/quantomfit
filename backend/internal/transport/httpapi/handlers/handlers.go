package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	appauth "quantomfit/backend/internal/app/auth"
	apphealth "quantomfit/backend/internal/app/health"
	apppanel "quantomfit/backend/internal/app/panel"
	"quantomfit/backend/internal/infrastructure/db"
	"quantomfit/backend/internal/platform/requestcontext"
	"quantomfit/backend/internal/transport/httpapi/dto"
	"quantomfit/backend/internal/transport/httpapi/response"
)

type Handlers struct {
	HealthService *apphealth.Service
	PanelService  *apppanel.Service
	AuthService   *appauth.Service
	Store         *db.Store
}

func New(health *apphealth.Service, panel *apppanel.Service, auth *appauth.Service, store *db.Store) *Handlers {
	return &Handlers{
		HealthService: health,
		PanelService:  panel,
		AuthService:   auth,
		Store:         store,
	}
}

func (h *Handlers) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}

	tenantID, _ := requestcontext.TenantFrom(r.Context())
	tenantValue := tenantID.ID
	if tenantValue == "platform" {
		tenantValue = ""
	}

	session, err := h.AuthService.Login(r.Context(), tenantValue, req.Email, req.Password)
	if err != nil {
		status := http.StatusUnauthorized
		if errors.Is(err, db.ErrNoRows) {
			status = http.StatusUnauthorized
		}
		response.JSON(w, status, map[string]any{"error": "invalid credentials"})
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"accessToken":  session.AccessToken,
		"refreshToken": session.RefreshToken,
		"claims":       session.Claims,
		"expiresAt":    session.ExpiresAt,
	})
}

func (h *Handlers) Refresh(w http.ResponseWriter, r *http.Request) {
	var req dto.RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	session, err := h.AuthService.Refresh(r.Context(), req.RefreshToken)
	if err != nil {
		response.JSON(w, http.StatusUnauthorized, map[string]any{"error": "invalid refresh token"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"accessToken":  session.AccessToken,
		"refreshToken": session.RefreshToken,
		"claims":       session.Claims,
		"expiresAt":    session.ExpiresAt,
	})
}

func (h *Handlers) Logout(w http.ResponseWriter, r *http.Request) {
	var req dto.LogoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	if err := h.AuthService.Logout(r.Context(), req.RefreshToken); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "unable to logout"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (h *Handlers) Me(w http.ResponseWriter, r *http.Request) {
	claims, _ := requestcontext.ClaimsFrom(r.Context())
	tenant, _ := requestcontext.TenantFrom(r.Context())
	response.JSON(w, http.StatusOK, map[string]any{
		"userId": claims.UserID,
		"tenant": tenant,
		"role":   claims.Role,
		"panel":  claims.Panel,
	})
}

func (h *Handlers) CreateGym(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateGymRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}

	created, err := h.PanelService.CreateGym(r.Context(), db.GymCreateInput{
		Name:          req.Name,
		Slug:          req.Slug,
		Subdomain:     req.Subdomain,
		PlanCode:      req.PlanCode,
		OwnerEmail:    req.OwnerEmail,
		OwnerPassword: req.OwnerPassword,
		OwnerPhone:    req.OwnerPhone,
		GymType:       req.GymType,
		Location:      req.Location,
		SizeSqm:       req.SizeSqm,
		Timezone:      req.Timezone,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	response.JSON(w, http.StatusCreated, created)
}

func (h *Handlers) OnboardingState(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	state, err := h.PanelService.OnboardingState(r.Context(), tenant.ID)
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load onboarding state"})
		return
	}
	response.JSON(w, http.StatusOK, state)
}

func (h *Handlers) UpdateOnboardingState(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	var req dto.UpdateOnboardingStateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}

	state, err := h.PanelService.UpdateOnboardingState(r.Context(), tenant.ID, db.OnboardingUpdateInput{
		Step:      req.Step,
		Payload:   req.Payload,
		Completed: req.Completed,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	response.JSON(w, http.StatusOK, state)
}

func (h *Handlers) Dashboard(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	summary, err := h.PanelService.Dashboard(r.Context(), tenant.ID)
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load dashboard"})
		return
	}
	response.JSON(w, http.StatusOK, summary)
}

func (h *Handlers) OccupancyCurrent(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	payload, err := h.PanelService.Occupancy(r.Context(), tenant.ID)
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load occupancy"})
		return
	}
	response.JSON(w, http.StatusOK, payload)
}

func (h *Handlers) OccupancyStream(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	flusher, ok := w.(http.Flusher)
	if !ok {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "streaming unsupported"})
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.WriteHeader(http.StatusOK)

	ctx := r.Context()
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	send := func(event string) {
		payload, err := h.PanelService.Occupancy(ctx, tenant.ID)
		if err != nil {
			return
		}
		message, err := json.Marshal(map[string]any{
			"event": event,
			"data":  payload,
		})
		if err != nil {
			return
		}
		_, _ = w.Write([]byte("data: " + string(message) + "\n\n"))
		flusher.Flush()
	}

	send("snapshot")
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			send("update")
		}
	}
}

func (h *Handlers) AttendanceList(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	items, err := h.PanelService.Attendance(r.Context(), tenant.ID, queryLimit(r, 8))
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load attendance"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) SMSAutomationRules(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	switch r.Method {
	case http.MethodGet:
		items, err := h.PanelService.SMSAutomationRules(r.Context(), tenant.ID, queryLimit(r, 24))
		if err != nil {
			response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load sms automation rules"})
			return
		}
		response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
	case http.MethodPost:
		var req dto.SMSAutomationRuleRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
			return
		}
		item, err := h.PanelService.UpsertSMSAutomationRule(r.Context(), tenant.ID, db.SMSAutomationRuleInput{
			RuleName:        req.RuleName,
			TriggerType:     req.TriggerType,
			Condition:       req.Condition,
			MessageTemplate: req.MessageTemplate,
			Channel:         req.Channel,
			Status:          req.Status,
			LastTriggeredAt: parseOptionalTime(req.LastTriggeredAt),
			NextTriggerAt:   parseOptionalTime(req.NextTriggerAt),
		})
		if err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		response.JSON(w, http.StatusCreated, item)
	default:
		response.JSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "method not allowed"})
	}
}

func (h *Handlers) SMSAutomationRuleByID(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	ruleID := strings.TrimSpace(r.PathValue("ruleID"))
	if ruleID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "rule id is required"})
		return
	}
	switch r.Method {
	case http.MethodPatch:
		var req dto.SMSAutomationRuleRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
			return
		}
		item, err := h.PanelService.UpdateSMSAutomationRule(r.Context(), tenant.ID, ruleID, db.SMSAutomationRuleInput{
			RuleName:        req.RuleName,
			TriggerType:     req.TriggerType,
			Condition:       req.Condition,
			MessageTemplate: req.MessageTemplate,
			Channel:         req.Channel,
			Status:          req.Status,
			LastTriggeredAt: parseOptionalTime(req.LastTriggeredAt),
			NextTriggerAt:   parseOptionalTime(req.NextTriggerAt),
		})
		if err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		response.JSON(w, http.StatusOK, item)
	case http.MethodDelete:
		if err := h.PanelService.DeleteSMSAutomationRule(r.Context(), tenant.ID, ruleID); err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": "unable to delete sms automation rule"})
			return
		}
		response.JSON(w, http.StatusOK, map[string]any{"deleted": true, "id": ruleID})
	default:
		response.JSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "method not allowed"})
	}
}

func (h *Handlers) SMSAutomationLogs(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	items, err := h.PanelService.SMSAutomationLogs(r.Context(), tenant.ID, queryLimit(r, 24))
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load sms automation logs"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) MembersList(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	items, err := h.PanelService.Members(r.Context(), tenant.ID, queryLimit(r, 24))
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load members"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) CreateMember(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	var req dto.MemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.Store.CreateMember(r.Context(), tenant.ID, db.MemberUpsertInput{
		ExternalRef: req.ExternalRef,
		FullName:    req.FullName,
		Phone:       req.Phone,
		Gender:      req.Gender,
		Status:      req.Status,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusCreated, item)
}

func (h *Handlers) UpdateMember(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	memberID := strings.TrimSpace(r.PathValue("memberID"))
	if memberID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "member id is required"})
		return
	}
	var req dto.MemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.Store.UpdateMember(r.Context(), tenant.ID, memberID, db.MemberUpsertInput{
		ExternalRef: req.ExternalRef,
		FullName:    req.FullName,
		Phone:       req.Phone,
		Gender:      req.Gender,
		Status:      req.Status,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *Handlers) DeleteMember(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	memberID := strings.TrimSpace(r.PathValue("memberID"))
	if memberID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "member id is required"})
		return
	}
	if err := h.Store.DeleteMember(r.Context(), tenant.ID, memberID); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"deleted": true, "id": memberID})
}

func (h *Handlers) MemberDetail(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	memberID := strings.TrimSpace(r.PathValue("memberID"))
	if memberID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "member id is required"})
		return
	}

	member, err := h.PanelService.Member(r.Context(), tenant.ID, memberID)
	if err != nil {
		response.JSON(w, http.StatusNotFound, map[string]any{"error": "member not found"})
		return
	}

	response.JSON(w, http.StatusOK, member)
}

func (h *Handlers) AssignMemberProgram(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	memberID := strings.TrimSpace(r.PathValue("memberID"))
	if memberID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "member id is required"})
		return
	}

	var req dto.AssignMemberProgramRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	if strings.TrimSpace(req.ProgramID) == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "program id is required"})
		return
	}

	member, err := h.PanelService.AssignMemberProgram(r.Context(), tenant.ID, memberID, req.ProgramID)
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, member)
}

func (h *Handlers) TrainersList(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	items, err := h.PanelService.Trainers(r.Context(), tenant.ID, queryLimit(r, 24))
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load trainers"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) CreateTrainer(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	var req dto.TrainerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.Store.CreateTrainer(r.Context(), tenant.ID, db.TrainerUpsertInput{
		UserID:    req.UserID,
		FullName:  req.FullName,
		Specialty: req.Specialty,
		Status:    req.Status,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusCreated, item)
}

func (h *Handlers) TrainerDetail(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	trainerID := strings.TrimSpace(r.PathValue("trainerID"))
	if trainerID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "trainer id is required"})
		return
	}
	item, err := h.Store.GetTrainerByID(r.Context(), tenant.ID, trainerID)
	if err != nil {
		response.JSON(w, http.StatusNotFound, map[string]any{"error": "trainer not found"})
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *Handlers) UpdateTrainer(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	trainerID := strings.TrimSpace(r.PathValue("trainerID"))
	if trainerID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "trainer id is required"})
		return
	}
	var req dto.TrainerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.Store.UpdateTrainer(r.Context(), tenant.ID, trainerID, db.TrainerUpsertInput{
		UserID:    req.UserID,
		FullName:  req.FullName,
		Specialty: req.Specialty,
		Status:    req.Status,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *Handlers) DeleteTrainer(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	trainerID := strings.TrimSpace(r.PathValue("trainerID"))
	if trainerID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "trainer id is required"})
		return
	}
	if err := h.Store.DeleteTrainer(r.Context(), tenant.ID, trainerID); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"deleted": true, "id": trainerID})
}

func (h *Handlers) ProgramsList(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	items, err := h.PanelService.Programs(r.Context(), tenant.ID, queryLimit(r, 24))
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load programs"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) ProgramDetail(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	programID := strings.TrimSpace(r.PathValue("programID"))
	if programID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "program id is required"})
		return
	}
	item, err := h.PanelService.Program(r.Context(), tenant.ID, programID)
	if err != nil {
		response.JSON(w, http.StatusNotFound, map[string]any{"error": "program not found"})
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *Handlers) ProgramSessions(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	programID := strings.TrimSpace(r.PathValue("programID"))
	if programID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "program id is required"})
		return
	}
	items, err := h.PanelService.ProgramSessions(r.Context(), tenant.ID, programID, queryLimit(r, 24))
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load program sessions"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) CreateProgramSession(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	programID := strings.TrimSpace(r.PathValue("programID"))
	if programID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "program id is required"})
		return
	}
	var req dto.CreateSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.PanelService.CreateProgramSession(r.Context(), tenant.ID, programID, db.WorkoutSessionInput{
		Title:    req.Title,
		DayLabel: req.DayLabel,
		MemberID: req.MemberID,
		Notes:    req.Notes,
		Status:   req.Status,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusCreated, item)
}

func (h *Handlers) UpdateSession(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	sessionID := strings.TrimSpace(r.PathValue("sessionID"))
	if sessionID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "session id is required"})
		return
	}
	var req dto.UpdateSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.PanelService.UpdateSession(r.Context(), tenant.ID, sessionID, db.WorkoutSessionInput{
		Title:    req.Title,
		DayLabel: req.DayLabel,
		MemberID: req.MemberID,
		Notes:    req.Notes,
		Status:   req.Status,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *Handlers) SessionsList(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	items, err := h.PanelService.Sessions(r.Context(), tenant.ID, queryLimit(r, 24))
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load sessions"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) CompleteSession(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	sessionID := strings.TrimSpace(r.PathValue("sessionID"))
	if sessionID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "session id is required"})
		return
	}
	item, err := h.PanelService.CompleteSession(r.Context(), tenant.ID, sessionID)
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *Handlers) CreateProgram(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	var req dto.CreateProgramRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.PanelService.CreateProgram(r.Context(), tenant.ID, db.WorkoutProgramInput{
		Name:      req.Name,
		TrainerID: req.TrainerID,
		Status:    req.Status,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusCreated, item)
}

func (h *Handlers) UpdateProgram(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	programID := strings.TrimSpace(r.PathValue("programID"))
	if programID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "program id is required"})
		return
	}
	var req dto.UpdateProgramRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.PanelService.UpdateProgram(r.Context(), tenant.ID, programID, db.WorkoutProgramInput{
		Name:      req.Name,
		TrainerID: req.TrainerID,
		Status:    req.Status,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *Handlers) CurrentProgram(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	items, err := h.PanelService.Programs(r.Context(), tenant.ID, 1)
	if err != nil || len(items) == 0 {
		response.JSON(w, http.StatusOK, map[string]any{"program": nil, "items": []any{}})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"program": items[0], "items": items})
}

func (h *Handlers) AnalyticsDashboard(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	summary, err := h.PanelService.Dashboard(r.Context(), tenant.ID)
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load analytics"})
		return
	}

	series := []map[string]any{}
	labels := []string{"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"}
	base := []int{summary.Attendance.Today - 18, summary.Attendance.Today - 12, summary.Attendance.Today - 6, summary.Attendance.Today - 4, summary.Attendance.Today, summary.Attendance.Today - 3, summary.Attendance.Today - 7}
	for i, label := range labels {
		value := base[i]
		if value < 0 {
			value = i * 10
		}
		series = append(series, map[string]any{"label": label, "value": value})
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"series": series,
		"kpis": map[string]any{
			"revenueGrowth":   12.8,
			"memberRetention": 91.4,
			"occupancyPeak":   summary.Occupancy.Ratio,
		},
	})
}

func (h *Handlers) Subscriptions(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	payload, err := h.PanelService.Subscription(r.Context(), tenant.ID)
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load subscription"})
		return
	}
	response.JSON(w, http.StatusOK, payload)
}

func (h *Handlers) EquipmentList(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	items, err := h.PanelService.Equipment(r.Context(), tenant.ID, queryLimit(r, 24))
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load equipment"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) CreateEquipment(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	var req dto.EquipmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.Store.CreateEquipment(r.Context(), tenant.ID, db.EquipmentUpsertInput{
		Name:     req.Name,
		Category: req.Category,
		Quantity: req.Quantity,
		Status:   req.Status,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusCreated, item)
}

func (h *Handlers) UpdateEquipment(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	equipmentID := strings.TrimSpace(r.PathValue("equipmentID"))
	if equipmentID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "equipment id is required"})
		return
	}
	var req dto.EquipmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.Store.UpdateEquipment(r.Context(), tenant.ID, equipmentID, db.EquipmentUpsertInput{
		Name:     req.Name,
		Category: req.Category,
		Quantity: req.Quantity,
		Status:   req.Status,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *Handlers) DeleteEquipment(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	equipmentID := strings.TrimSpace(r.PathValue("equipmentID"))
	if equipmentID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "equipment id is required"})
		return
	}
	if err := h.Store.DeleteEquipment(r.Context(), tenant.ID, equipmentID); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"deleted": true, "id": equipmentID})
}

func (h *Handlers) ClassesList(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	items, err := h.Store.ListClasses(r.Context(), tenant.ID, queryLimit(r, 24))
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load classes"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) CreateClass(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	var req dto.GymClassRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.Store.CreateClass(r.Context(), tenant.ID, db.GymClassUpsertInput{
		TrainerID: req.TrainerID,
		Title:     req.Title,
		Capacity:  req.Capacity,
		Schedule:  req.Schedule,
		Status:    req.Status,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusCreated, item)
}

func (h *Handlers) UpdateClass(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	classID := strings.TrimSpace(r.PathValue("classID"))
	if classID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "class id is required"})
		return
	}
	var req dto.GymClassRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.Store.UpdateClass(r.Context(), tenant.ID, classID, db.GymClassUpsertInput{
		TrainerID: req.TrainerID,
		Title:     req.Title,
		Capacity:  req.Capacity,
		Schedule:  req.Schedule,
		Status:    req.Status,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, item)
}

func (h *Handlers) DeleteClass(w http.ResponseWriter, r *http.Request) {
	tenant, _ := requestcontext.TenantFrom(r.Context())
	classID := strings.TrimSpace(r.PathValue("classID"))
	if classID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "class id is required"})
		return
	}
	if err := h.Store.DeleteClass(r.Context(), tenant.ID, classID); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"deleted": true, "id": classID})
}

func (h *Handlers) ListGyms(w http.ResponseWriter, r *http.Request) {
	items, err := h.PanelService.ListGyms(r.Context())
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to list gyms"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"items": items,
		"count": len(items),
	})
}

func (h *Handlers) UpdateGym(w http.ResponseWriter, r *http.Request) {
	gymID := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/api/v1/admin/gyms/"))
	if gymID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "gym id is required"})
		return
	}

	var req dto.UpdateGymRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}

	updated, err := h.Store.UpdateGymMetadata(r.Context(), gymID, req.Name, req.Slug, req.Subdomain, req.PlanCode, req.Status, req.OnboardingStatus, req.Timezone)
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, updated)
}

func (h *Handlers) DeleteGym(w http.ResponseWriter, r *http.Request) {
	gymID := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/api/v1/admin/gyms/"))
	if gymID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "gym id is required"})
		return
	}
	updated, err := h.Store.SetGymStatus(r.Context(), gymID, "inactive", "archived")
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, updated)
}

func (h *Handlers) AdminUsers(w http.ResponseWriter, r *http.Request) {
	items, err := h.Store.ListUsers(r.Context())
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to list users"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) AdminUserByID(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/api/v1/admin/users/"))
	if userID == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "user id is required"})
		return
	}
	var req struct {
		Status   string `json:"status"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}

	switch r.Method {
	case http.MethodPatch:
		if strings.TrimSpace(req.Status) != "" {
			user, err := h.Store.SetUserStatus(r.Context(), userID, req.Status)
			if err != nil {
				response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
				return
			}
			if strings.TrimSpace(req.Password) != "" {
				if err := h.Store.ResetUserPassword(r.Context(), userID, req.Password); err != nil {
					response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
					return
				}
			}
			response.JSON(w, http.StatusOK, user)
			return
		}
		if strings.TrimSpace(req.Password) != "" {
			if err := h.Store.ResetUserPassword(r.Context(), userID, req.Password); err != nil {
				response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
				return
			}
			user, err := h.Store.GetUserByID(r.Context(), userID)
			if err != nil {
				response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
				return
			}
			response.JSON(w, http.StatusOK, user)
			return
		}
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "status or password is required"})
	default:
		response.JSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "method not allowed"})
	}
}

func (h *Handlers) WebsiteContent(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		items, err := h.Store.WebsiteContent(r.Context())
		if err != nil {
			response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load website content"})
			return
		}
		response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
	case http.MethodPut, http.MethodPatch:
		var req dto.CMSContentRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
			return
		}
		item, err := h.Store.UpsertWebsiteContent(r.Context(), db.WebsiteContentRecord{
			Locale:       req.Locale,
			Section:      req.Section,
			Title:        req.Title,
			Subtitle:     req.Subtitle,
			Body:         req.Body,
			CTA:          req.CTA,
			Features:     req.Features,
			FAQ:          req.Faq,
			Testimonials: req.Testimonials,
			Images:       req.Images,
			Meta:         req.Meta,
		})
		if err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		response.JSON(w, http.StatusOK, item)
	default:
		response.JSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "method not allowed"})
	}
}

func (h *Handlers) AdminDashboard(w http.ResponseWriter, r *http.Request) {
	summary, err := h.PanelService.PlatformSummary(r.Context())
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load admin dashboard"})
		return
	}
	response.JSON(w, http.StatusOK, summary)
}

func (h *Handlers) CreatePlan(w http.ResponseWriter, r *http.Request) {
	var req dto.CreatePlanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	plan, err := h.Store.UpsertPricingPlan(r.Context(), db.PricingPlanUpsertInput{
		Code:         req.Code,
		Name:         req.Name,
		MonthlyPrice: req.MonthlyPrice,
		YearlyPrice:  req.YearlyPrice,
		Currency:     req.Currency,
		Description:  req.Description,
		Limits:       req.Limits,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusCreated, plan)
}

func (h *Handlers) UpdatePlan(w http.ResponseWriter, r *http.Request) {
	code := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/api/v1/admin/plans/"))
	if code == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "plan code is required"})
		return
	}
	var req dto.UpdatePlanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	plan, err := h.Store.UpsertPricingPlan(r.Context(), db.PricingPlanUpsertInput{
		Code:         code,
		Name:         req.Name,
		MonthlyPrice: req.MonthlyPrice,
		YearlyPrice:  req.YearlyPrice,
		Currency:     req.Currency,
		Description:  req.Description,
		Limits:       req.Limits,
		Active:       req.Active,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, plan)
}

func (h *Handlers) DeletePlan(w http.ResponseWriter, r *http.Request) {
	code := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/api/v1/admin/plans/"))
	if code == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "plan code is required"})
		return
	}
	if err := h.Store.SetPricingPlanActive(r.Context(), code, false); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"deleted": true, "code": code})
}

func (h *Handlers) CreateCoupon(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateCouponRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	var startsAt, endsAt *time.Time
	if req.StartsAt != nil && strings.TrimSpace(*req.StartsAt) != "" {
		if parsed, err := time.Parse(time.RFC3339, *req.StartsAt); err == nil {
			value := parsed.UTC()
			startsAt = &value
		}
	}
	if req.EndsAt != nil && strings.TrimSpace(*req.EndsAt) != "" {
		if parsed, err := time.Parse(time.RFC3339, *req.EndsAt); err == nil {
			value := parsed.UTC()
			endsAt = &value
		}
	}
	coupon, err := h.Store.UpsertCoupon(r.Context(), db.CouponUpsertInput{
		Code:               req.Code,
		DiscountType:       req.DiscountType,
		DiscountValue:      req.DiscountValue,
		ApplicablePlanCode: req.ApplicablePlanCode,
		PanelType:          req.PanelType,
		FirstPurchaseOnly:  req.FirstPurchaseOnly,
		UsageLimit:         req.UsageLimit,
		UsagePerCustomer:   req.UsagePerCustomer,
		Stackable:          req.Stackable,
		Description:        req.Description,
		InternalNote:       req.InternalNote,
		StartsAt:           startsAt,
		EndsAt:             endsAt,
		IsActive:           req.IsActive,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusCreated, coupon)
}

func (h *Handlers) UpdateCoupon(w http.ResponseWriter, r *http.Request) {
	code := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/api/v1/admin/coupons/"))
	if code == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "coupon code is required"})
		return
	}
	var req dto.UpdateCouponRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	var startsAt, endsAt *time.Time
	if req.StartsAt != nil && strings.TrimSpace(*req.StartsAt) != "" {
		if parsed, err := time.Parse(time.RFC3339, *req.StartsAt); err == nil {
			value := parsed.UTC()
			startsAt = &value
		}
	}
	if req.EndsAt != nil && strings.TrimSpace(*req.EndsAt) != "" {
		if parsed, err := time.Parse(time.RFC3339, *req.EndsAt); err == nil {
			value := parsed.UTC()
			endsAt = &value
		}
	}
	coupon, err := h.Store.UpsertCoupon(r.Context(), db.CouponUpsertInput{
		Code:               code,
		DiscountType:       req.DiscountType,
		DiscountValue:      req.DiscountValue,
		ApplicablePlanCode: req.ApplicablePlanCode,
		PanelType:          req.PanelType,
		FirstPurchaseOnly:  req.FirstPurchaseOnly,
		UsageLimit:         req.UsageLimit,
		UsagePerCustomer:   req.UsagePerCustomer,
		Stackable:          req.Stackable,
		Description:        req.Description,
		InternalNote:       req.InternalNote,
		StartsAt:           startsAt,
		EndsAt:             endsAt,
		IsActive:           req.IsActive,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, coupon)
}

func (h *Handlers) DeleteCoupon(w http.ResponseWriter, r *http.Request) {
	code := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/api/v1/admin/coupons/"))
	if code == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "coupon code is required"})
		return
	}
	if err := h.Store.SetCouponActive(r.Context(), code, false); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"deleted": true, "code": code})
}

func (h *Handlers) PublicPricing(w http.ResponseWriter, r *http.Request) {
	if strings.TrimSpace(r.URL.Query().Get("quote")) != "" || strings.TrimSpace(r.URL.Query().Get("planCode")) != "" {
		quote, err := h.PanelService.QuotePricing(
			r.Context(),
			r.URL.Query().Get("planCode"),
			r.URL.Query().Get("gymId"),
			r.URL.Query().Get("couponCode"),
			r.URL.Query().Get("billingCycle"),
		)
		if err != nil {
			if errors.Is(err, db.ErrNoRows) {
				response.JSON(w, http.StatusNotFound, map[string]any{"error": "pricing plan not found"})
				return
			}
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		response.JSON(w, http.StatusOK, quote)
		return
	}

	items, err := h.PanelService.Plans(r.Context())
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load pricing"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) PublicWebsiteContent(w http.ResponseWriter, r *http.Request) {
	items, err := h.Store.WebsiteContent(r.Context())
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load website content"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) PublicGyms(w http.ResponseWriter, r *http.Request) {
	items, err := h.Store.PublicGyms(r.Context())
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load gyms"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) PublicGymBySlug(w http.ResponseWriter, r *http.Request) {
	slug := strings.TrimSpace(r.PathValue("slug"))
	if slug == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "gym slug is required"})
		return
	}
	profile, err := h.Store.PublicGymProfile(r.Context(), slug)
	if err != nil {
		if errors.Is(err, db.ErrNoRows) {
			response.JSON(w, http.StatusNotFound, map[string]any{"error": "gym not found"})
			return
		}
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load gym profile"})
		return
	}
	response.JSON(w, http.StatusOK, profile)
}

func (h *Handlers) PublicDemoRequest(w http.ResponseWriter, r *http.Request) {
	var req dto.DemoRequestRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
		return
	}
	item, err := h.PanelService.CreateDemoRequest(r.Context(), db.DemoRequestUpsertInput{
		RequestType: req.RequestType,
		PanelType:   req.PanelType,
		Name:        req.Name,
		Email:       req.Email,
		Phone:       req.Phone,
		CompanyName: req.CompanyName,
		Message:     req.Message,
		Status:      req.Status,
		Source:      req.Source,
		Metadata:    req.Metadata,
	})
	if err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	response.JSON(w, http.StatusCreated, item)
}

func (h *Handlers) CustomerDiscounts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		items, err := h.PanelService.CustomerDiscounts(r.Context())
		if err != nil {
			response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load customer discounts"})
			return
		}
		response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
	case http.MethodPost:
		var req dto.CustomerDiscountRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
			return
		}
		var startsAt, endsAt *time.Time
		if req.StartsAt != nil && strings.TrimSpace(*req.StartsAt) != "" {
			if parsed, err := time.Parse(time.RFC3339, *req.StartsAt); err == nil {
				value := parsed.UTC()
				startsAt = &value
			}
		}
		if req.EndsAt != nil && strings.TrimSpace(*req.EndsAt) != "" {
			if parsed, err := time.Parse(time.RFC3339, *req.EndsAt); err == nil {
				value := parsed.UTC()
				endsAt = &value
			}
		}
		item, err := h.PanelService.UpsertCustomerDiscount(r.Context(), db.CustomerDiscountUpsertInput{
			GymID:          req.GymID,
			PlanCode:       req.PlanCode,
			DiscountType:   req.DiscountType,
			DiscountValue:  req.DiscountValue,
			DurationMonths: req.DurationMonths,
			StartsAt:       startsAt,
			EndsAt:         endsAt,
			Reason:         req.Reason,
			IsActive:       req.IsActive,
			Stackable:      req.Stackable,
		})
		if err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		response.JSON(w, http.StatusCreated, item)
	default:
		response.JSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "method not allowed"})
	}
}

func (h *Handlers) CustomerDiscountByID(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/api/v1/admin/customer-discounts/"))
	if id == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "discount id is required"})
		return
	}
	switch r.Method {
	case http.MethodDelete:
		if err := h.PanelService.DeleteCustomerDiscount(r.Context(), id); err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": "unable to delete customer discount"})
			return
		}
		response.JSON(w, http.StatusOK, map[string]any{"deleted": true, "id": id})
	default:
		response.JSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "method not allowed"})
	}
}

func (h *Handlers) DemoAccesses(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		items, err := h.PanelService.DemoAccesses(r.Context())
		if err != nil {
			response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load demo accesses"})
			return
		}
		response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
	case http.MethodPost:
		var req dto.DemoAccessRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
			return
		}
		expiresAt, err := time.Parse(time.RFC3339, req.ExpiresAt)
		if err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid expiresAt"})
			return
		}
		item, err := h.PanelService.UpsertDemoAccess(r.Context(), db.DemoAccessUpsertInput{
			TenantID:           req.TenantID,
			DemoType:           req.DemoType,
			PanelType:          req.PanelType,
			AccountName:        req.AccountName,
			Username:           req.Username,
			Password:           req.Password,
			FeatureAccessLevel: req.FeatureAccessLevel,
			ReadOnly:           req.ReadOnly,
			ExpiresAt:          expiresAt,
			IsActive:           req.IsActive,
			Notes:              req.Notes,
		})
		if err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		response.JSON(w, http.StatusCreated, item)
	default:
		response.JSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "method not allowed"})
	}
}

func (h *Handlers) DemoAccessByID(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/api/v1/admin/demo-accounts/"))
	if id == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "demo account id is required"})
		return
	}
	switch r.Method {
	case http.MethodDelete:
		if err := h.PanelService.DeleteDemoAccess(r.Context(), id); err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": "unable to delete demo account"})
			return
		}
		response.JSON(w, http.StatusOK, map[string]any{"deleted": true, "id": id})
	default:
		response.JSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "method not allowed"})
	}
}

func (h *Handlers) DemoRequests(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		items, err := h.PanelService.DemoRequests(r.Context())
		if err != nil {
			response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load demo requests"})
			return
		}
		response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
	case http.MethodPatch:
		id := strings.TrimSpace(r.PathValue("id"))
		var req dto.DemoRequestRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
			return
		}
		item, err := h.PanelService.UpdateDemoRequestStatus(r.Context(), id, req.Status)
		if err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		response.JSON(w, http.StatusOK, item)
	default:
		response.JSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "method not allowed"})
	}
}

func (h *Handlers) MediaFiles(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		items, err := h.PanelService.MediaFiles(r.Context(), strings.TrimSpace(r.URL.Query().Get("gymId")))
		if err != nil {
			response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load media"})
			return
		}
		response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
	case http.MethodPost:
		var req dto.MediaFileRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": "invalid request body"})
			return
		}
		item, err := h.PanelService.UpsertMediaFile(r.Context(), db.MediaFileUpsertInput{
			GymID:    req.GymID,
			Kind:     req.Kind,
			URL:      req.URL,
			Alt:      req.Alt,
			Metadata: req.Metadata,
		})
		if err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		response.JSON(w, http.StatusCreated, item)
	default:
		response.JSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "method not allowed"})
	}
}

func (h *Handlers) MediaFileByID(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/api/v1/admin/media/"))
	if id == "" {
		response.JSON(w, http.StatusBadRequest, map[string]any{"error": "media id is required"})
		return
	}
	switch r.Method {
	case http.MethodDelete:
		if err := h.PanelService.DeleteMediaFile(r.Context(), id); err != nil {
			response.JSON(w, http.StatusBadRequest, map[string]any{"error": "unable to delete media file"})
			return
		}
		response.JSON(w, http.StatusOK, map[string]any{"deleted": true, "id": id})
	default:
		response.JSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "method not allowed"})
	}
}

func (h *Handlers) Plans(w http.ResponseWriter, r *http.Request) {
	items, err := h.PanelService.Plans(r.Context())
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to list plans"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) Coupons(w http.ResponseWriter, r *http.Request) {
	items, err := h.PanelService.Coupons(r.Context())
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to list coupons"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (h *Handlers) Platform(w http.ResponseWriter, r *http.Request) {
	summary, err := h.PanelService.PlatformSummary(r.Context())
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]any{"error": "unable to load platform summary"})
		return
	}
	response.JSON(w, http.StatusOK, summary)
}

func (h *Handlers) Health(w http.ResponseWriter, r *http.Request) {
	response.JSON(w, http.StatusOK, h.HealthService.Status())
}

func queryLimit(r *http.Request, fallback int) int {
	limit := strings.TrimSpace(r.URL.Query().Get("limit"))
	if limit == "" {
		return fallback
	}
	value, err := strconv.Atoi(limit)
	if err != nil || value <= 0 {
		return fallback
	}
	if value > 100 {
		return 100
	}
	return value
}

func parseOptionalTime(raw *string) *time.Time {
	if raw == nil {
		return nil
	}
	value := strings.TrimSpace(*raw)
	if value == "" {
		return nil
	}
	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return nil
	}
	out := parsed.UTC()
	return &out
}
