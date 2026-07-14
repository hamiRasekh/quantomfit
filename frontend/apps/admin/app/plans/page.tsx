"use client";

import { useEffect, useState, useCallback } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: { "X-Panel-Context": "admin" },
});

/* ── Types ── */
type PlanLimits = {
  gyms?: number;
  members?: number;
  trainers?: number;
  classes?: number;
  smsPerMonth?: number;
  analytics?: boolean;
  apiAccess?: boolean;
  customDomain?: boolean;
  support?: "basic" | "priority" | "dedicated";
};

type Plan = {
  code: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  description: string;
  limits: PlanLimits;
  isActive: boolean;
};

type ModalMode = "create" | "edit" | null;

const EMPTY_FORM: Omit<Plan, "isActive"> = {
  code: "",
  name: "",
  monthlyPrice: 0,
  yearlyPrice: 0,
  currency: "USD",
  description: "",
  limits: {
    gyms: 1,
    members: 250,
    trainers: 5,
    classes: 10,
    smsPerMonth: 500,
    analytics: false,
    apiAccess: false,
    customDomain: false,
    support: "basic",
  },
};

const PLAN_BADGES: Record<string, { color: string; bg: string; label: string }> = {
  starter: { color: "#06b6d4", bg: "rgba(6,182,212,0.1)", label: "پایه" },
  growth: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "استاندارد" },
  enterprise: { color: "#7e3df2", bg: "rgba(126,61,242,0.1)", label: "حرفه‌ای" },
};

function getPlanBadge(code: string) {
  return PLAN_BADGES[code.toLowerCase()] ?? { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: code };
}

/* ── Icons ── */
function IconPlus() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  );
}
function IconToggle({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      {active
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      }
    </svg>
  );
}
function IconCheck({ color }: { color: string }) {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
function IconX({ color }: { color: string }) {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

/* ── Main Page ── */
export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await api.get<{ items: Plan[] }>("/api/v1/plans");
      setPlans(payload.items ?? []);
    } catch {
      setPlans([]);
      showToast("دریافت پلن‌ها با خطا مواجه شد", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingPlan(null);
    setModalMode("create");
  }

  function openEdit(plan: Plan) {
    setForm({
      code: plan.code,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice ?? 0,
      yearlyPrice: plan.yearlyPrice ?? 0,
      currency: plan.currency ?? "USD",
      description: plan.description ?? "",
      limits: {
        gyms: (plan.limits as PlanLimits)?.gyms ?? 1,
        members: (plan.limits as PlanLimits)?.members ?? 250,
        trainers: (plan.limits as PlanLimits)?.trainers ?? 5,
        classes: (plan.limits as PlanLimits)?.classes ?? 10,
        smsPerMonth: (plan.limits as PlanLimits)?.smsPerMonth ?? 500,
        analytics: (plan.limits as PlanLimits)?.analytics ?? false,
        apiAccess: (plan.limits as PlanLimits)?.apiAccess ?? false,
        customDomain: (plan.limits as PlanLimits)?.customDomain ?? false,
        support: (plan.limits as PlanLimits)?.support ?? "basic",
      },
    });
    setEditingPlan(plan);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingPlan(null);
    setSaving(false);
  }

  const setLimits = (patch: Partial<PlanLimits>) => {
    setForm(f => ({ ...f, limits: { ...f.limits, ...patch } }));
  };

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) {
      showToast("کد و نام پلن الزامی هستند", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        name: form.name,
        monthlyPrice: form.monthlyPrice,
        yearlyPrice: form.yearlyPrice,
        currency: form.currency || "USD",
        description: form.description,
        limits: form.limits,
      };

      if (modalMode === "create") {
        const created = await api.post<Plan>("/api/v1/admin/plans", payload);
        setPlans(p => [created, ...p.filter(x => x.code !== created.code)]);
        showToast("پلن جدید با موفقیت ساخته شد");
      } else if (editingPlan) {
        const updated = await api.patch<Plan>(`/api/v1/admin/plans/${editingPlan.code}`, {
          name: payload.name,
          monthlyPrice: payload.monthlyPrice,
          yearlyPrice: payload.yearlyPrice,
          currency: payload.currency,
          description: payload.description,
          limits: payload.limits,
          active: editingPlan.isActive,
        });
        setPlans(p => p.map(x => x.code === updated.code ? updated : x));
        showToast("پلن با موفقیت به‌روزرسانی شد");
      }
      closeModal();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "ذخیره پلن ممکن نشد", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(plan: Plan) {
    if (plan.isActive) {
      setConfirmDeactivate(plan.code);
      return;
    }
    try {
      await api.patch(`/api/v1/admin/plans/${plan.code}`, { active: true });
      setPlans(p => p.map(x => x.code === plan.code ? { ...x, isActive: true } : x));
      showToast("پلن فعال شد");
    } catch {
      showToast("تغییر وضعیت ممکن نشد", "error");
    }
  }

  async function confirmDeactivation() {
    if (!confirmDeactivate) return;
    try {
      await api.delete(`/api/v1/admin/plans/${confirmDeactivate}`);
      setPlans(p => p.map(x => x.code === confirmDeactivate ? { ...x, isActive: false } : x));
      showToast("پلن غیرفعال شد");
    } catch {
      showToast("غیرفعال‌سازی ممکن نشد", "error");
    } finally {
      setConfirmDeactivate(null);
    }
  }

  function formatPrice(price: number, currency: string) {
    if (!price) return "رایگان";
    return `${price.toLocaleString()} ${currency}`;
  }

  const stats = {
    total: plans.length,
    active: plans.filter(p => p.isActive).length,
    totalRevenue: plans.reduce((sum, p) => sum + (p.monthlyPrice || 0), 0),
  };

  return (
    <>
      {/* ── Toast Notification ── */}
      {toast && (
        <div className="qf-plans-toast" data-type={toast.type}>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Confirm Deactivate Dialog ── */}
      {confirmDeactivate && (
        <div className="qf-modal-backdrop" onClick={() => setConfirmDeactivate(null)}>
          <div className="qf-confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="qf-confirm-icon">⚠️</div>
            <h3>غیرفعال‌سازی پلن</h3>
            <p>آیا مطمئن هستید که می‌خواهید پلن <strong>{confirmDeactivate}</strong> را غیرفعال کنید؟ باشگاه‌های دارای این پلن تحت تأثیر قرار می‌گیرند.</p>
            <div className="qf-confirm-actions">
              <button className="qf-btn qf-btn-ghost" onClick={() => setConfirmDeactivate(null)}>انصراف</button>
              <button className="qf-btn qf-btn-danger" onClick={confirmDeactivation}>بله، غیرفعال کن</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Plan Modal ── */}
      {modalMode && (
        <div className="qf-modal-backdrop" onClick={closeModal}>
          <div className="qf-plans-modal" onClick={e => e.stopPropagation()} dir="rtl">
            {/* Modal Header */}
            <div className="qf-modal-header">
              <div className="qf-modal-title-group">
                <span className="qf-modal-tag">{modalMode === "create" ? "ایجاد پلن جدید" : "ویرایش پلن"}</span>
                <h2>{modalMode === "create" ? "تعریف پلن اشتراک جدید" : `ویرایش پلن ${editingPlan?.name}`}</h2>
              </div>
              <button className="qf-modal-close-btn" onClick={closeModal}><IconClose /></button>
            </div>

            <div className="qf-modal-body">
              {/* Section 1: Basic Info */}
              <div className="qf-form-section">
                <div className="qf-form-section-label">
                  <span className="qf-form-section-num">۱</span>
                  اطلاعات پایه
                </div>
                <div className="qf-form-grid-2">
                  <div className="qf-form-field">
                    <label htmlFor="plan-code">کد یکتای پلن</label>
                    <input
                      id="plan-code"
                      className="qf-input"
                      value={form.code}
                      onChange={e => setForm(f => ({ ...f, code: e.target.value.toLowerCase().replace(/\s/g, "-") }))}
                      placeholder="مثال: growth-plus"
                      disabled={modalMode === "edit"}
                    />
                    <span className="qf-input-hint">از حروف انگلیسی و خط تیره استفاده کنید</span>
                  </div>
                  <div className="qf-form-field">
                    <label htmlFor="plan-name">نام نمایشی</label>
                    <input
                      id="plan-name"
                      className="qf-input"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="مثال: استاندارد پلاس"
                    />
                  </div>
                </div>
                <div className="qf-form-field">
                  <label htmlFor="plan-desc">توضیح نمایشی</label>
                  <textarea
                    id="plan-desc"
                    className="qf-input qf-textarea"
                    rows={2}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="توضیح کوتاه برای نمایش در صفحه قیمت‌گذاری..."
                  />
                </div>
              </div>

              {/* Section 2: Pricing */}
              <div className="qf-form-section">
                <div className="qf-form-section-label">
                  <span className="qf-form-section-num">۲</span>
                  قیمت‌گذاری
                </div>
                <div className="qf-form-grid-3">
                  <div className="qf-form-field">
                    <label htmlFor="plan-monthly">قیمت ماهانه</label>
                    <div className="qf-input-prefix-wrapper">
                      <span className="qf-input-prefix">{form.currency || "USD"}</span>
                      <input
                        id="plan-monthly"
                        type="number"
                        className="qf-input qf-input-prefixed"
                        min={0}
                        value={form.monthlyPrice}
                        onChange={e => setForm(f => ({ ...f, monthlyPrice: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="qf-form-field">
                    <label htmlFor="plan-yearly">قیمت سالانه</label>
                    <div className="qf-input-prefix-wrapper">
                      <span className="qf-input-prefix">{form.currency || "USD"}</span>
                      <input
                        id="plan-yearly"
                        type="number"
                        className="qf-input qf-input-prefixed"
                        min={0}
                        value={form.yearlyPrice}
                        onChange={e => setForm(f => ({ ...f, yearlyPrice: Number(e.target.value) }))}
                      />
                    </div>
                    {form.monthlyPrice > 0 && form.yearlyPrice > 0 && (
                      <span className="qf-input-hint" style={{ color: "#10b981" }}>
                        {Math.round((1 - form.yearlyPrice / (form.monthlyPrice * 12)) * 100)}٪ تخفیف سالانه
                      </span>
                    )}
                  </div>
                  <div className="qf-form-field">
                    <label htmlFor="plan-currency">ارز</label>
                    <select
                      id="plan-currency"
                      className="qf-input qf-select"
                      value={form.currency}
                      onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    >
                      <option value="USD">دلار (USD)</option>
                      <option value="IRR">ریال (IRR)</option>
                      <option value="EUR">یورو (EUR)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Limits & Features */}
              <div className="qf-form-section">
                <div className="qf-form-section-label">
                  <span className="qf-form-section-num">۳</span>
                  محدودیت‌ها و قابلیت‌ها
                </div>

                <div className="qf-form-grid-2">
                  <div className="qf-form-field">
                    <label htmlFor="limit-gyms">تعداد باشگاه‌ها</label>
                    <input
                      id="limit-gyms"
                      type="number"
                      className="qf-input"
                      min={1}
                      value={form.limits.gyms ?? 1}
                      onChange={e => setLimits({ gyms: Number(e.target.value) })}
                    />
                  </div>
                  <div className="qf-form-field">
                    <label htmlFor="limit-members">تعداد اعضا</label>
                    <input
                      id="limit-members"
                      type="number"
                      className="qf-input"
                      min={1}
                      value={form.limits.members ?? 250}
                      onChange={e => setLimits({ members: Number(e.target.value) })}
                    />
                  </div>
                  <div className="qf-form-field">
                    <label htmlFor="limit-trainers">تعداد مربیان</label>
                    <input
                      id="limit-trainers"
                      type="number"
                      className="qf-input"
                      min={1}
                      value={form.limits.trainers ?? 5}
                      onChange={e => setLimits({ trainers: Number(e.target.value) })}
                    />
                  </div>
                  <div className="qf-form-field">
                    <label htmlFor="limit-classes">تعداد کلاس‌ها</label>
                    <input
                      id="limit-classes"
                      type="number"
                      className="qf-input"
                      min={0}
                      value={form.limits.classes ?? 10}
                      onChange={e => setLimits({ classes: Number(e.target.value) })}
                    />
                  </div>
                  <div className="qf-form-field">
                    <label htmlFor="limit-sms">پیامک ماهانه</label>
                    <input
                      id="limit-sms"
                      type="number"
                      className="qf-input"
                      min={0}
                      value={form.limits.smsPerMonth ?? 500}
                      onChange={e => setLimits({ smsPerMonth: Number(e.target.value) })}
                    />
                  </div>
                  <div className="qf-form-field">
                    <label htmlFor="limit-support">نوع پشتیبانی</label>
                    <select
                      id="limit-support"
                      className="qf-input qf-select"
                      value={form.limits.support ?? "basic"}
                      onChange={e => setLimits({ support: e.target.value as "basic" | "priority" | "dedicated" })}
                    >
                      <option value="basic">پشتیبانی پایه</option>
                      <option value="priority">پشتیبانی اولویت‌دار</option>
                      <option value="dedicated">پشتیبانی اختصاصی</option>
                    </select>
                  </div>
                </div>

                {/* Boolean feature toggles */}
                <div className="qf-feature-toggles">
                  <label className="qf-toggle-row">
                    <div className="qf-toggle-info">
                      <span className="qf-toggle-name">آنالیتیکس پیشرفته</span>
                      <span className="qf-toggle-desc">دسترسی به گزارش‌های پیشرفته و داشبورد آماری</span>
                    </div>
                    <input
                      type="checkbox"
                      className="qf-toggle-input"
                      checked={form.limits.analytics ?? false}
                      onChange={e => setLimits({ analytics: e.target.checked })}
                    />
                    <div className={`qf-toggle-switch ${form.limits.analytics ? "active" : ""}`} />
                  </label>
                  <label className="qf-toggle-row">
                    <div className="qf-toggle-info">
                      <span className="qf-toggle-name">دسترسی به API</span>
                      <span className="qf-toggle-desc">امکان اتصال سیستم‌های خارجی از طریق API</span>
                    </div>
                    <input
                      type="checkbox"
                      className="qf-toggle-input"
                      checked={form.limits.apiAccess ?? false}
                      onChange={e => setLimits({ apiAccess: e.target.checked })}
                    />
                    <div className={`qf-toggle-switch ${form.limits.apiAccess ? "active" : ""}`} />
                  </label>
                  <label className="qf-toggle-row">
                    <div className="qf-toggle-info">
                      <span className="qf-toggle-name">دامنه اختصاصی</span>
                      <span className="qf-toggle-desc">استفاده از دامنه سفارشی برای پنل باشگاه</span>
                    </div>
                    <input
                      type="checkbox"
                      className="qf-toggle-input"
                      checked={form.limits.customDomain ?? false}
                      onChange={e => setLimits({ customDomain: e.target.checked })}
                    />
                    <div className={`qf-toggle-switch ${form.limits.customDomain ? "active" : ""}`} />
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="qf-modal-footer">
              <button className="qf-btn qf-btn-ghost" onClick={closeModal} disabled={saving}>انصراف</button>
              <button className="qf-btn qf-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "در حال ذخیره..." : modalMode === "create" ? "ایجاد پلن" : "ذخیره تغییرات"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Content ── */}
      <section className="qf-plans-page">
        {/* Header */}
        <div className="qf-plans-header">
          <div className="qf-plans-header-text">
            <div className="qf-plans-breadcrumb">مدیریت پلتفرم / پلن‌های اشتراک</div>
            <h1 className="qf-plans-title">مدیریت پلن‌های اشتراک</h1>
            <p className="qf-plans-subtitle">تعریف، ویرایش و مدیریت پلن‌های فروش، قیمت‌گذاری و دسترسی‌های هر پلن در پنل باشگاه و مربی</p>
          </div>
          <div className="qf-plans-header-actions">
            <button className="qf-btn qf-btn-ghost" onClick={fetchPlans} title="بارگذاری مجدد">
              <IconRefresh />
            </button>
            <button className="qf-btn qf-btn-primary" onClick={openCreate}>
              <IconPlus />
              پلن جدید
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="qf-plans-stats-bar">
          <div className="qf-stat-pill">
            <span className="qf-stat-dot" style={{ background: "#7e3df2" }} />
            <span className="qf-stat-label">کل پلن‌ها:</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="qf-stat-pill">
            <span className="qf-stat-dot" style={{ background: "#10b981" }} />
            <span className="qf-stat-label">فعال:</span>
            <strong>{stats.active}</strong>
          </div>
          <div className="qf-stat-pill">
            <span className="qf-stat-dot" style={{ background: "#f43f5e" }} />
            <span className="qf-stat-label">غیرفعال:</span>
            <strong>{stats.total - stats.active}</strong>
          </div>
        </div>

        {/* Plans Table */}
        <div className="qf-plans-table-card">
          {/* Table header */}
          <div className="qf-plans-table-header">
            <div className="qf-plans-table-col qf-col-plan">پلن</div>
            <div className="qf-plans-table-col qf-col-price">قیمت‌گذاری</div>
            <div className="qf-plans-table-col qf-col-limits">محدودیت‌ها</div>
            <div className="qf-plans-table-col qf-col-features">قابلیت‌ها</div>
            <div className="qf-plans-table-col qf-col-status">وضعیت</div>
            <div className="qf-plans-table-col qf-col-actions">عملیات</div>
          </div>

          {/* Table body */}
          {loading ? (
            <div className="qf-plans-loading">
              <div className="qf-plans-spinner" />
              <span>در حال دریافت پلن‌ها...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="qf-plans-empty">
              <div className="qf-plans-empty-icon">📦</div>
              <h3>هیچ پلنی تعریف نشده</h3>
              <p>اولین پلن اشتراک خود را از طریق دکمه "پلن جدید" ایجاد کنید</p>
              <button className="qf-btn qf-btn-primary" onClick={openCreate}><IconPlus /> ایجاد اولین پلن</button>
            </div>
          ) : (
            plans.map(plan => {
              const badge = getPlanBadge(plan.code);
              const limits = plan.limits as PlanLimits;
              return (
                <div key={plan.code} className={`qf-plans-table-row ${plan.isActive ? "" : "qf-row-inactive"}`}>
                  {/* Plan column */}
                  <div className="qf-plans-table-col qf-col-plan">
                    <div className="qf-plan-identity">
                      <div className="qf-plan-badge-dot" style={{ background: badge.color }} />
                      <div>
                        <div className="qf-plan-name">{plan.name}</div>
                        <code className="qf-plan-code" style={{ color: badge.color }}>{plan.code}</code>
                        {plan.description && (
                          <div className="qf-plan-desc">{plan.description}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price column */}
                  <div className="qf-plans-table-col qf-col-price">
                    <div className="qf-price-block">
                      <div className="qf-price-monthly">
                        <span className="qf-price-amount">{formatPrice(plan.monthlyPrice, plan.currency)}</span>
                        <span className="qf-price-period">/ماه</span>
                      </div>
                      {plan.yearlyPrice > 0 && (
                        <div className="qf-price-yearly">
                          <span>{formatPrice(plan.yearlyPrice, plan.currency)}/سال</span>
                          {plan.monthlyPrice > 0 && (
                            <span className="qf-price-discount">
                              {Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)}٪ off
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Limits column */}
                  <div className="qf-plans-table-col qf-col-limits">
                    <div className="qf-limits-chips">
                      {limits?.gyms && <span className="qf-limit-chip">{limits.gyms} باشگاه</span>}
                      {limits?.members && <span className="qf-limit-chip">{limits.members.toLocaleString()} عضو</span>}
                      {limits?.trainers && <span className="qf-limit-chip">{limits.trainers} مربی</span>}
                      {limits?.smsPerMonth && <span className="qf-limit-chip">{limits.smsPerMonth.toLocaleString()} SMS</span>}
                    </div>
                  </div>

                  {/* Features column */}
                  <div className="qf-plans-table-col qf-col-features">
                    <div className="qf-features-list">
                      <div className={`qf-feature-item ${limits?.analytics ? "active" : "inactive"}`}>
                        {limits?.analytics ? <IconCheck color="#10b981" /> : <IconX color="#ef4444" />}
                        آنالیتیکس
                      </div>
                      <div className={`qf-feature-item ${limits?.apiAccess ? "active" : "inactive"}`}>
                        {limits?.apiAccess ? <IconCheck color="#10b981" /> : <IconX color="#ef4444" />}
                        API
                      </div>
                      <div className={`qf-feature-item ${limits?.customDomain ? "active" : "inactive"}`}>
                        {limits?.customDomain ? <IconCheck color="#10b981" /> : <IconX color="#ef4444" />}
                        دامنه اختصاصی
                      </div>
                    </div>
                  </div>

                  {/* Status column */}
                  <div className="qf-plans-table-col qf-col-status">
                    <div className={`qf-status-badge ${plan.isActive ? "active" : "inactive"}`}>
                      <span className="qf-status-dot" />
                      {plan.isActive ? "فعال" : "غیرفعال"}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="qf-plans-table-col qf-col-actions">
                    <div className="qf-actions-group">
                      <button
                        className="qf-action-btn qf-action-edit"
                        onClick={() => openEdit(plan)}
                        title="ویرایش پلن"
                      >
                        <IconEdit />
                        ویرایش
                      </button>
                      <button
                        className={`qf-action-btn ${plan.isActive ? "qf-action-deactivate" : "qf-action-activate"}`}
                        onClick={() => handleToggleActive(plan)}
                        title={plan.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
                      >
                        <IconToggle active={plan.isActive} />
                        {plan.isActive ? "غیرفعال" : "فعال"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
