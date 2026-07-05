package panel

import (
	"context"
	"time"

	"quantomfit/backend/internal/infrastructure/db"
)

type Service struct {
	store       *db.Store
	serviceName string
	version     string
	env         string
	builtAt     time.Time
	startedAt   time.Time
}

func NewService(store *db.Store, serviceName, version, env string, builtAt, startedAt time.Time) *Service {
	return &Service{
		store:       store,
		serviceName: serviceName,
		version:     version,
		env:         env,
		builtAt:     builtAt.UTC(),
		startedAt:   startedAt.UTC(),
	}
}

func (s *Service) PlatformSummary(ctx context.Context) (db.PlatformSummary, error) {
	return s.store.PlatformSummary(ctx, s.serviceName, s.version, s.env, s.builtAt, s.startedAt)
}

func (s *Service) ListGyms(ctx context.Context) ([]db.GymRecord, error) {
	return s.store.ListGyms(ctx)
}

func (s *Service) CreateGym(ctx context.Context, input db.GymCreateInput) (db.CreatedGym, error) {
	return s.store.CreateGym(ctx, input)
}

func (s *Service) Dashboard(ctx context.Context, tenantID string) (db.DashboardSummary, error) {
	return s.store.DashboardSummary(ctx, tenantID)
}

func (s *Service) OnboardingState(ctx context.Context, tenantID string) (db.OnboardingState, error) {
	return s.store.OnboardingState(ctx, tenantID)
}

func (s *Service) UpdateOnboardingState(ctx context.Context, tenantID string, input db.OnboardingUpdateInput) (db.OnboardingState, error) {
	return s.store.UpdateOnboardingState(ctx, tenantID, input)
}

func (s *Service) Occupancy(ctx context.Context, tenantID string) (map[string]any, error) {
	dashboard, err := s.store.DashboardSummary(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	return map[string]any{
		"tenantId":   tenantID,
		"current":    dashboard.Occupancy.Current,
		"capacity":   dashboard.Occupancy.Capacity,
		"ratio":      dashboard.Occupancy.Ratio,
		"capturedAt": dashboard.Occupancy.CapturedAt,
		"heatmap":    dashboard.Occupancy.Heatmap,
	}, nil
}

func (s *Service) Attendance(ctx context.Context, tenantID string, limit int) ([]db.AttendanceItem, error) {
	return s.store.ListAttendance(ctx, tenantID, limit)
}

func (s *Service) Members(ctx context.Context, tenantID string, limit int) ([]db.MemberItem, error) {
	return s.store.ListMembers(ctx, tenantID, limit)
}

func (s *Service) Member(ctx context.Context, tenantID, memberID string) (db.MemberDetail, error) {
	return s.store.GetMemberByID(ctx, tenantID, memberID)
}

func (s *Service) Trainers(ctx context.Context, tenantID string, limit int) ([]db.TrainerItem, error) {
	return s.store.ListTrainers(ctx, tenantID, limit)
}

func (s *Service) Programs(ctx context.Context, tenantID string, limit int) ([]db.WorkoutProgramItem, error) {
	return s.store.ListWorkoutPrograms(ctx, tenantID, limit)
}

func (s *Service) Program(ctx context.Context, tenantID, programID string) (db.WorkoutProgramItem, error) {
	return s.store.GetWorkoutProgramByID(ctx, tenantID, programID)
}

func (s *Service) CreateProgram(ctx context.Context, tenantID string, input db.WorkoutProgramInput) (db.WorkoutProgramItem, error) {
	return s.store.CreateWorkoutProgram(ctx, tenantID, input)
}

func (s *Service) UpdateProgram(ctx context.Context, tenantID, programID string, input db.WorkoutProgramInput) (db.WorkoutProgramItem, error) {
	return s.store.UpdateWorkoutProgram(ctx, tenantID, programID, input)
}

func (s *Service) AssignMemberProgram(ctx context.Context, tenantID, memberID, programID string) (db.MemberDetail, error) {
	return s.store.AssignMemberProgram(ctx, tenantID, memberID, programID)
}

func (s *Service) Sessions(ctx context.Context, tenantID string, limit int) ([]db.WorkoutSessionItem, error) {
	return s.store.ListWorkoutSessions(ctx, tenantID, limit)
}

func (s *Service) ProgramSessions(ctx context.Context, tenantID, programID string, limit int) ([]db.WorkoutSessionItem, error) {
	return s.store.ListProgramSessions(ctx, tenantID, programID, limit)
}

func (s *Service) CreateProgramSession(ctx context.Context, tenantID, programID string, input db.WorkoutSessionInput) (db.WorkoutSessionItem, error) {
	return s.store.CreateWorkoutSession(ctx, tenantID, programID, input)
}

func (s *Service) UpdateSession(ctx context.Context, tenantID, sessionID string, input db.WorkoutSessionInput) (db.WorkoutSessionItem, error) {
	return s.store.UpdateWorkoutSession(ctx, tenantID, sessionID, input)
}

func (s *Service) CompleteSession(ctx context.Context, tenantID, sessionID string) (db.WorkoutSessionItem, error) {
	return s.store.CompleteWorkoutSession(ctx, tenantID, sessionID)
}

func (s *Service) Equipment(ctx context.Context, tenantID string, limit int) ([]db.EquipmentItem, error) {
	return s.store.ListEquipment(ctx, tenantID, limit)
}

func (s *Service) Subscription(ctx context.Context, tenantID string) (map[string]any, error) {
	return s.store.Subscription(ctx, tenantID)
}

func (s *Service) SMSAutomationRules(ctx context.Context, tenantID string, limit int) ([]db.SMSAutomationRuleItem, error) {
	return s.store.ListSMSAutomationRules(ctx, tenantID, limit)
}

func (s *Service) UpsertSMSAutomationRule(ctx context.Context, tenantID string, input db.SMSAutomationRuleInput) (db.SMSAutomationRuleItem, error) {
	return s.store.UpsertSMSAutomationRule(ctx, tenantID, input)
}

func (s *Service) UpdateSMSAutomationRule(ctx context.Context, tenantID, ruleID string, input db.SMSAutomationRuleInput) (db.SMSAutomationRuleItem, error) {
	return s.store.UpdateSMSAutomationRule(ctx, tenantID, ruleID, input)
}

func (s *Service) DeleteSMSAutomationRule(ctx context.Context, tenantID, ruleID string) error {
	return s.store.DeleteSMSAutomationRule(ctx, tenantID, ruleID)
}

func (s *Service) SMSAutomationLogs(ctx context.Context, tenantID string, limit int) ([]db.SMSAutomationLogItem, error) {
	return s.store.ListSMSAutomationLogs(ctx, tenantID, limit)
}

func (s *Service) Plans(ctx context.Context) ([]db.PricingPlan, error) {
	return s.store.ListPricingPlans(ctx)
}

func (s *Service) Coupons(ctx context.Context) ([]db.Coupon, error) {
	return s.store.ListCoupons(ctx)
}

func (s *Service) CustomerDiscounts(ctx context.Context) ([]db.CustomerDiscountRecord, error) {
	return s.store.ListCustomerDiscounts(ctx)
}

func (s *Service) UpsertCustomerDiscount(ctx context.Context, input db.CustomerDiscountUpsertInput) (db.CustomerDiscountRecord, error) {
	return s.store.UpsertCustomerDiscount(ctx, input)
}

func (s *Service) DeleteCustomerDiscount(ctx context.Context, id string) error {
	return s.store.DeleteCustomerDiscount(ctx, id)
}

func (s *Service) DemoAccesses(ctx context.Context) ([]db.DemoAccessRecord, error) {
	return s.store.ListDemoAccesses(ctx)
}

func (s *Service) UpsertDemoAccess(ctx context.Context, input db.DemoAccessUpsertInput) (db.DemoAccessRecord, error) {
	return s.store.UpsertDemoAccess(ctx, input)
}

func (s *Service) DeleteDemoAccess(ctx context.Context, id string) error {
	return s.store.DeleteDemoAccess(ctx, id)
}

func (s *Service) DemoRequests(ctx context.Context) ([]db.DemoRequestRecord, error) {
	return s.store.ListDemoRequests(ctx)
}

func (s *Service) CreateDemoRequest(ctx context.Context, input db.DemoRequestUpsertInput) (db.DemoRequestRecord, error) {
	return s.store.CreateDemoRequest(ctx, input)
}

func (s *Service) UpdateDemoRequestStatus(ctx context.Context, id, status string) (db.DemoRequestRecord, error) {
	return s.store.UpdateDemoRequestStatus(ctx, id, status)
}

func (s *Service) MediaFiles(ctx context.Context, gymID string) ([]db.MediaFileRecord, error) {
	return s.store.ListMediaFiles(ctx, gymID)
}

func (s *Service) UpsertMediaFile(ctx context.Context, input db.MediaFileUpsertInput) (db.MediaFileRecord, error) {
	return s.store.UpsertMediaFile(ctx, input)
}

func (s *Service) DeleteMediaFile(ctx context.Context, id string) error {
	return s.store.DeleteMediaFile(ctx, id)
}

func (s *Service) QuotePricing(ctx context.Context, planCode, gymID, couponCode, billingCycle string) (db.PricingQuote, error) {
	return s.store.QuotePricing(ctx, planCode, gymID, couponCode, billingCycle)
}
