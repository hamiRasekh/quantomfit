"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";
import { QFSelect } from "@quantomfit/ui";

const api = createApiClient({ defaultHeaders: { "X-Panel-Context": "admin" } });

type Gym = {
  id: string; name: string; slug: string; subdomain: string; status: string;
  planCode: string; planName: string; subscriptionStatus: string; onboardingStatus: string;
  ownerId: string; ownerEmail: string; ownerPhone?: string; ownerLastLoginAt?: string;
  gymType?: string; location?: string; sizeSqm?: number; timezone: string;
  memberCount: number; trainerCount: number; activeMemberships: number;
  latestOccupancy: number; capacity: number; programCount: number; classCount: number;
  attendanceCount: number; equipmentCount: number; smsCount: number;
  analyticsEventCount: number; activeDays30: number; lastActivityAt?: string;
  createdAt: string; updatedAt: string;
};
type Plan = { code: string; name: string; isActive: boolean };

const FA_STATUS: Record<string, string> = {
  active: "فعال",
  inactive: "غیرفعال",
  pending: "در انتظار",
  archived: "بایگانی",
  trial: "آزمایشی",
  completed: "تکمیل"
};

const getStatusLabel = (val: string) => FA_STATUS[val] || val || "نامشخص";
const formatDate = (val?: string) => val ? new Date(val).toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" }) : "هنوز ثبت نشده";
const numberOrZero = (val?: number) => typeof val === "number" && Number.isFinite(val) ? val : 0;

const hydrateGym = (gym: Gym): Gym => ({
  ...gym,
  memberCount: numberOrZero(gym.memberCount), trainerCount: numberOrZero(gym.trainerCount),
  activeMemberships: numberOrZero(gym.activeMemberships), latestOccupancy: numberOrZero(gym.latestOccupancy),
  capacity: numberOrZero(gym.capacity), programCount: numberOrZero(gym.programCount),
  classCount: numberOrZero(gym.classCount), attendanceCount: numberOrZero(gym.attendanceCount),
  equipmentCount: numberOrZero(gym.equipmentCount), smsCount: numberOrZero(gym.smsCount),
  analyticsEventCount: numberOrZero(gym.analyticsEventCount), activeDays30: numberOrZero(gym.activeDays30),
});

export default function GymDetailPage({ params }: { params: Promise<{ gymId: string }> }) {
  const { gymId } = use(params);
  const [gym, setGym] = useState<Gym | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true); setMessage("");
    try {
      const [gymPayload, plansPayload] = await Promise.all([
        api.get<Gym>(`/api/v1/admin/gyms/${gymId}`),
        api.get<{ items: Plan[] }>("/api/v1/plans"),
      ]);
      const hydratedGym = hydrateGym(gymPayload);
      setGym(hydratedGym);
      setSelectedPlan(hydratedGym.planCode);
      setPlans((plansPayload.items ?? []).filter(plan => plan.isActive !== false));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "دریافت اطلاعات باشگاه ممکن نشد.");
    } finally { setLoading(false); }
  }, [gymId]);

  useEffect(() => { loadData(); }, [loadData]);

  const usageStats = useMemo(() => {
    if (!gym) return [];
    return [
      { key: "members", title: "اعضا و اشتراک‌ها", count: gym.memberCount, detail: `${gym.activeMemberships.toLocaleString("fa-IR")} عضویت ثبت‌شده`, icon: "👥" },
      { key: "trainers", title: "مربیان", count: gym.trainerCount, detail: "مربی ثبت‌نام شده", icon: "🏋️‍♂️" },
      { key: "programs", title: "برنامه‌های تمرینی", count: gym.programCount, detail: "برنامه ورزشی اختصاصی", icon: "📋" },
      { key: "classes", title: "کلاس‌ها", count: gym.classCount, detail: "کلاس تعریف‌شده", icon: "🏫" },
      { key: "attendance", title: "حضور و غیاب", count: gym.attendanceCount, detail: "تردد ثبت‌شده", icon: "🔑" },
      { key: "equipment", title: "تجهیزات سالن", count: gym.equipmentCount, detail: "دستگاه ثبت‌شده", icon: "⚙️" },
      { key: "sms", title: "پیامک و اتوماسیون", count: gym.smsCount, detail: "پیام پردازش‌شده", icon: "✉️" },
      { key: "analytics", title: "تحلیل و گزارش", count: gym.analyticsEventCount, detail: `${gym.activeDays30.toLocaleString("fa-IR")} روز فعال در ۳۰ روز اخیر`, icon: "📈" },
    ];
  }, [gym]);

  async function updateGymDetails(patch: Record<string, string>, successMsg: string) {
    if (!gym) return;
    setSaving(true); setMessage("");
    try {
      const updated = await api.patch<Gym>(`/api/v1/admin/gyms/${gym.id}`, patch);
      const hydratedGym = hydrateGym(updated);
      setGym(hydratedGym);
      setSelectedPlan(hydratedGym.planCode);
      setMessage(successMsg);
      setTimeout(() => setMessage(""), 3500);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره تغییرات ممکن نشد.");
    } finally { setSaving(false); }
  }

  if (loading) {
    return (
      <section className="qf-plans-page">
        <div className="qf-plans-loading">
          <div className="qf-plans-spinner" />
          <span>در حال دریافت پرونده کامل باشگاه...</span>
        </div>
      </section>
    );
  }

  if (!gym) {
    return (
      <section className="qf-plans-page">
        <div className="qf-plans-empty">
          <div className="qf-plans-empty-icon">🏢</div>
          <h3>باشگاه پیدا نشد</h3>
          <p>{message}</p>
          <a className="qf-btn qf-btn-ghost" href="/gyms">بازگشت به لیست</a>
        </div>
      </section>
    );
  }

  const isActive = gym.status === "active";
  const hostName = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const panelLoginUrl = hostName === "localhost"
    ? `http://${gym.subdomain}.localhost:3001/login`
    : `https://${gym.subdomain}.${hostName.replace(/^admin\./, "")}/login`;

  return (
    <section className="qf-plans-page">
      {/* Toast Notification */}
      {message && (
        <div className="qf-plans-toast" data-type="success">
          <span>{message}</span>
        </div>
      )}

      {/* Header */}
      <div className="qf-plans-header" style={{ alignItems: "center" }}>
        <div className="qf-plans-header-text">
          <div className="qf-plans-breadcrumb">مدیریت پلتفرم / باشگاه‌ها / جزئیات</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
            <span className="qf-gym-avatar" style={{ width: "42px", height: "42px", display: "grid", placeItems: "center", fontSize: "1.1rem" }}>
              {gym.name.slice(0, 1)}
            </span>
            <div>
              <h1 className="qf-plans-title" style={{ fontSize: "1.35rem", margin: 0 }}>{gym.name}</h1>
              <code style={{ fontSize: "0.74rem", color: "#5a78ff", direction: "ltr" }}>
                {gym.subdomain}.quantumfit.ir
              </code>
            </div>
          </div>
        </div>
        <div className="qf-plans-header-actions">
          <a className="qf-btn qf-btn-ghost" href="/gyms">
            بازگشت به لیست
          </a>
          <a className="qf-btn qf-btn-primary" href={panelLoginUrl} target="_blank" rel="noreferrer">
            ورود به پنل باشگاه ↗
          </a>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="qf-plans-stats-bar" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div className="qf-stat-pill" style={{ padding: "16px 20px", borderRadius: "18px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
          <span className="qf-stat-label">تعداد اعضا</span>
          <strong style={{ fontSize: "1.5rem" }}>{gym.memberCount.toLocaleString("fa-IR")}</strong>
          <small style={{ fontSize: "0.72rem", color: "var(--muted)" }}>ورزشکار ثبت‌شده</small>
        </div>
        <div className="qf-stat-pill" style={{ padding: "16px 20px", borderRadius: "18px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
          <span className="qf-stat-label">مربیان فعال</span>
          <strong style={{ fontSize: "1.5rem" }}>{gym.trainerCount.toLocaleString("fa-IR")}</strong>
          <small style={{ fontSize: "0.72rem", color: "var(--muted)" }}>مربی ثبت‌شده</small>
        </div>
        <div className="qf-stat-pill" style={{ padding: "16px 20px", borderRadius: "18px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
          <span className="qf-stat-label">فعالیت ۳۰ روز اخیر</span>
          <strong style={{ fontSize: "1.5rem", color: "#fbbf24" }}>{gym.activeDays30.toLocaleString("fa-IR")} روز</strong>
          <small style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
            {gym.lastActivityAt ? `آخرین فعالیت: ${formatDate(gym.lastActivityAt)}` : "بدون فعالیت ورزشی"}
          </small>
        </div>
        <div className="qf-stat-pill" style={{ padding: "16px 20px", borderRadius: "18px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
          <span className="qf-stat-label">اشغال لحظه‌ای سالن</span>
          <strong style={{ fontSize: "1.5rem", color: "#10b981" }}>
            {gym.latestOccupancy.toLocaleString("fa-IR")} / {gym.capacity.toLocaleString("fa-IR")}
          </strong>
          <small style={{ fontSize: "0.72rem", color: "var(--muted)" }}>تردد زنده اعضا</small>
        </div>
      </div>

      {/* Main Grid: Details & Side Column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
        
        {/* Left Side: Usage & Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Usage Metrics Card */}
          <article className="qf-plans-table-card" style={{ padding: "24px" }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "14px", marginBottom: "18px" }}>
              <span style={{ fontSize: "0.72rem", color: "#a272ff", fontWeight: "bold" }}>آنالیز رفتار محصول</span>
              <h2 style={{ fontSize: "1.05rem", margin: "4px 0 0 0" }}>میزان استفاده از بخش‌های پنل</h2>
              <p style={{ fontSize: "0.74rem", color: "var(--muted)", margin: "4px 0 0 0" }}>تعداد رکوردهای تعاملی ثبت شده در دیتابیس برای ارزیابی فعال بودن باشگاه</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {usageStats.map(item => {
                const hasUsage = item.count > 0;
                return (
                  <div
                    key={item.key}
                    style={{
                      display: "flex", alignItems: "center", justifyBetween: "space-between", gap: "12px", padding: "14px",
                      borderRadius: "14px", border: "1px solid var(--border)",
                      background: hasUsage ? "rgba(16, 185, 129, 0.04)" : "rgba(255,255,255,0.01)",
                      borderColor: hasUsage ? "rgba(16, 185, 129, 0.25)" : "var(--border)"
                    }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: "bold" }}>{item.title}</div>
                      <small style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{item.detail}</small>
                    </div>
                    <b style={{ fontSize: "1.05rem", color: hasUsage ? "#10b981" : "var(--muted)" }}>
                      {item.count.toLocaleString("fa-IR")}
                    </b>
                  </div>
                );
              })}
            </div>
          </article>

          {/* Basic Details Card */}
          <article className="qf-plans-table-card" style={{ padding: "24px" }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "14px", marginBottom: "18px" }}>
              <span style={{ fontSize: "0.72rem", color: "#a272ff", fontWeight: "bold" }}>اطلاعات ساختاری</span>
              <h2 style={{ fontSize: "1.05rem", margin: "4px 0 0 0" }}>مشخصات ثبتی و فیزیکی مجموعه</h2>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>شناسه یکتا (Slug)</span>
                <strong style={{ fontSize: "0.86rem", color: "var(--text)" }}>{gym.slug}</strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>نوع سالن ورزشی</span>
                <strong style={{ fontSize: "0.86rem", color: "var(--text)" }}>
                  {({ mixed: "عمومی / مختلط", male: "آقایان", female: "بانوان" } as Record<string, string>)[gym.gymType || ""] || gym.gymType || "ثبت نشده"}
                </strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>موقعیت فیزیکی</span>
                <strong style={{ fontSize: "0.86rem", color: "var(--text)" }}>{gym.location || "ثبت نشده"}</strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>مساحت سالن</span>
                <strong style={{ fontSize: "0.86rem", color: "var(--text)" }}>
                  {gym.sizeSqm ? `${gym.sizeSqm.toLocaleString("fa-IR")} متر مربع` : "ثبت نشده"}
                </strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>منطقه زمانی</span>
                <strong style={{ fontSize: "0.86rem", color: "var(--text)" }} dir="ltr">{gym.timezone}</strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>وضعیت آنبوردینگ</span>
                <strong style={{ fontSize: "0.86rem", color: "var(--text)" }}>{getStatusLabel(gym.onboardingStatus)}</strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>تاریخ راه‌اندازی در پلتفرم</span>
                <strong style={{ fontSize: "0.86rem", color: "var(--text)" }}>{formatDate(gym.createdAt)}</strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>آخرین تراکنش تغییر اطلاعات</span>
                <strong style={{ fontSize: "0.86rem", color: "var(--text)" }}>{formatDate(gym.updatedAt)}</strong>
              </div>
            </div>
          </article>

        </div>

        {/* Right Side: Configuration Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Owner Identity Card */}
          <article className="qf-plans-table-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.72rem", color: "#a272ff", fontWeight: "bold" }}>پروفایل مالک</span>
              <h3 style={{ fontSize: "0.95rem", margin: "2px 0 0 0" }}>مدیر ارشد حساب</h3>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="qf-gym-avatar" style={{ width: "36px", height: "36px", display: "grid", placeItems: "center", fontSize: "0.9rem" }}>
                🔑
              </span>
              <div>
                <strong style={{ fontSize: "0.86rem", display: "block" }}>{gym.ownerPhone || "موبایل ثبت نشده"}</strong>
                <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{gym.ownerEmail || "ایمیل ثبت نشده"}</span>
              </div>
            </div>
            
            <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.78rem" }}>
              <div style={{ display: "flex", justifyBetween: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>آخرین فعالیت ورود:</span>
                <strong style={{ marginRight: "auto" }}>{formatDate(gym.ownerLastLoginAt)}</strong>
              </div>
              <div style={{ display: "flex", justifyBetween: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>شناسه کاربری (UUID):</span>
                <code style={{ fontSize: "0.68rem", color: "var(--muted)", marginRight: "auto" }} dir="ltr">
                  {gym.ownerId ? gym.ownerId.slice(0, 8) + "..." : "—"}
                </code>
              </div>
            </div>
          </article>

          {/* Subscription and Plan Card */}
          <article className="qf-plans-table-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.72rem", color: "#a272ff", fontWeight: "bold" }}>جزئیات اشتراک</span>
              <h3 style={{ fontSize: "0.95rem", margin: "2px 0 0 0" }}>پلن تجاری و سقف دسترسی</h3>
            </div>
            
            <QFSelect
              label="تغییر پلن مالی"
              value={selectedPlan}
              onChange={e => setSelectedPlan(e.target.value)}
            >
              {plans.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </QFSelect>
            
            <button
              className="qf-btn qf-btn-primary"
              style={{ width: "100%", padding: "10px", fontSize: "0.8rem" }}
              disabled={saving || selectedPlan === gym.planCode}
              onClick={() => updateGymDetails({ planCode: selectedPlan }, "پلن باشگاه با موفقیت تغییر کرد.")}
            >
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات پلن"}
            </button>

            <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", borderTop: "1px dashed var(--border)", paddingTop: "12px", fontSize: "0.8rem" }}>
              <span style={{ color: "var(--muted)" }}>وضعیت اشتراک:</span>
              <b className={`qf-status-badge ${gym.subscriptionStatus === "active" ? "active" : "inactive"}`} style={{ marginRight: "auto", fontSize: "0.72rem", padding: "2px 8px" }}>
                <span className="qf-status-dot" />
                {getStatusLabel(gym.subscriptionStatus)}
              </b>
            </div>
          </article>

          {/* Danger Zone Card */}
          <article className="qf-plans-table-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", borderColor: "rgba(239, 68, 68, 0.2)" }}>
            <div style={{ borderBottom: "1px solid rgba(239, 68, 68, 0.15)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.72rem", color: "#ef4444", fontWeight: "bold" }}>اقدام حساس</span>
              <h3 style={{ fontSize: "0.95rem", margin: "2px 0 0 0", color: "#fff" }}>وضعیت دسترسی باشگاه</h3>
            </div>
            
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              {isActive
                ? "با غیرفعال‌سازی این باشگاه، تمام دسترسی‌های مالک، مربیان و اعضای ثبت‌نام شده فوراً متوقف می‌شود."
                : "با فعال‌سازی مجدد، دسترسی باشگاه به دیتابیس و پنل‌ها به وضعیت عادی بازمی‌گردد."}
            </p>
            
            <button
              className={isActive ? "qf-btn qf-btn-danger" : "qf-btn qf-btn-primary"}
              style={{ width: "100%", padding: "10px", fontSize: "0.8rem", background: isActive ? "" : "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
              disabled={saving}
              onClick={() => {
                if (!isActive || window.confirm("آیا مطمئن هستید که می‌خواهید دسترسی‌های این مجموعه ورزشی را کاملاً مسدود کنید؟")) {
                  updateGymDetails({ status: isActive ? "inactive" : "active" }, isActive ? "باشگاه غیرفعال شد." : "باشگاه دوباره فعال شد.");
                }
              }}
            >
              {isActive ? "غیرفعال‌سازی باشگاه" : "فعال‌سازی مجدد باشگاه"}
            </button>
          </article>

        </div>

      </div>
    </section>
  );
}
