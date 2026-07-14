"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createApiClient } from "@quantomfit/api-client";
import { QFInput, QFSelect } from "@quantomfit/ui";

const api = createApiClient({ defaultHeaders: { "X-Panel-Context": "admin" } });

type User = { id: string; email: string; phone?: string; status: string };
type Plan = { code: string; name: string; monthlyPrice?: number; currency?: string; isActive?: boolean };

export default function CreateGymPage() {
  const [ownerMode, setOwnerMode] = useState<"existing" | "new">("existing");
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [ownerQuery, setOwnerQuery] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    subdomain: "",
    planCode: "starter",
    ownerId: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerPassword: "",
    gymType: "mixed",
    location: "",
    sizeSqm: "",
    timezone: "Asia/Tehran"
  });

  useEffect(() => {
    Promise.all([
      api.get<{ items: User[] }>("/api/v1/admin/users"),
      api.get<{ items: Plan[] }>("/api/v1/plans")
    ])
      .then(([u, p]) => {
        setUsers((u.items ?? []).filter(x => x.status === "active"));
        setPlans((p.items ?? []).filter(x => x.isActive !== false));
      })
      .catch(() => setMessage("دریافت اطلاعات کاربران یا پلن‌ها ممکن نشد."));
  }, []);

  const suggestedSlug = useMemo(() => {
    return form.name
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, [form.name]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      `${user.phone || ""} ${user.email}`.toLowerCase().includes(ownerQuery.toLowerCase())
    );
  }, [users, ownerQuery]);

  const setVal = (key: string, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  // Autocomplete Slug and Subdomain when Name is entered and they are untouched
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(current => {
      const nextSlug = current.slug === "" || current.slug === suggestedSlug ? val.trim().toLowerCase().replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/^-|-$/g, "") : current.slug;
      return {
        ...current,
        name: val,
        slug: nextSlug,
        subdomain: current.subdomain === "" || current.subdomain === current.slug ? nextSlug : current.subdomain
      };
    });
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const targetSlug = form.slug || suggestedSlug;
    const targetSubdomain = form.subdomain || targetSlug;

    if (!form.name.trim()) {
      setMessage("نام باشگاه الزامی است.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = await api.post<{ gym: { id: string; name: string } }>("/api/v1/admin/gyms", {
        ...form,
        ownerId: ownerMode === "existing" ? form.ownerId : "",
        ownerEmail: ownerMode === "new" ? form.ownerEmail : "",
        ownerPhone: ownerMode === "new" ? form.ownerPhone : "",
        ownerPassword: ownerMode === "new" ? form.ownerPassword : "",
        slug: targetSlug,
        subdomain: targetSubdomain,
        sizeSqm: Number(form.sizeSqm || 0)
      });
      window.location.href = `/gyms/${payload.gym.id}`;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ساخت باشگاه انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="qf-plans-page">
      {/* Header */}
      <div className="qf-plans-header">
        <div className="qf-plans-header-text">
          <div className="qf-plans-breadcrumb">مدیریت پلتفرم / باشگاه‌ها</div>
          <h1 className="qf-plans-title">ساخت باشگاه جدید</h1>
          <p className="qf-plans-subtitle">راه‌اندازی باشگاه (مستأجر) جدید به همراه اطلاعات مالک، دامنه اختصاصی و پلن مالی.</p>
        </div>
        <div className="qf-plans-header-actions">
          <a className="qf-btn qf-btn-ghost" href="/gyms">
            بازگشت به باشگاه‌ها
          </a>
        </div>
      </div>

      <form className="qf-create-layout" onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
        
        {/* Form Body */}
        <div className="qf-form-stack" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Step 1: Owner */}
          <article className="qf-plans-table-card" style={{ padding: "24px" }}>
            <div className="qf-step-title" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <b style={{ background: "#7e3df2", color: "#fff", width: "28px", height: "28px", borderRadius: "8px", display: "grid", placeItems: "center", fontSize: "0.85rem" }}>۱</b>
              <div>
                <h2 style={{ fontSize: "1.05rem", margin: 0 }}>مالک و مدیر ارشد باشگاه</h2>
                <p style={{ fontSize: "0.76rem", color: "var(--muted)", margin: 0 }}>یک حساب کاربری موجود را انتخاب کرده یا برای ساخت مدیر جدید اقدام کنید.</p>
              </div>
            </div>

            {/* Segment Toggle */}
            <div className="qf-segment" style={{ display: "flex", gap: "8px", padding: "4px", border: "1px solid var(--border)", borderRadius: "12px", marginBottom: "18px" }}>
              <button
                type="button"
                className={ownerMode === "existing" ? "active" : ""}
                style={{
                  flex: 1, padding: "8px", border: 0, borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem",
                  background: ownerMode === "existing" ? "#7e3df2" : "transparent",
                  color: ownerMode === "existing" ? "#fff" : "var(--muted)",
                  fontWeight: ownerMode === "existing" ? "bold" : "normal"
                }}
                onClick={() => setOwnerMode("existing")}
              >
                انتخاب حساب کاربری موجود
              </button>
              <button
                type="button"
                className={ownerMode === "new" ? "active" : ""}
                style={{
                  flex: 1, padding: "8px", border: 0, borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem",
                  background: ownerMode === "new" ? "#7e3df2" : "transparent",
                  color: ownerMode === "new" ? "#fff" : "var(--muted)",
                  fontWeight: ownerMode === "new" ? "bold" : "normal"
                }}
                onClick={() => setOwnerMode("new")}
              >
                ساخت حساب کاربری جدید
              </button>
            </div>

            {/* Mode: Existing User */}
            {ownerMode === "existing" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <QFInput
                  label="جستجوی کاربر با موبایل یا ایمیل"
                  value={ownerQuery}
                  onChange={e => setOwnerQuery(e.target.value)}
                  placeholder="جستجو مثلاً 0912..."
                />
                
                <QFSelect
                  label="انتخاب کاربر مالک"
                  required
                  value={form.ownerId}
                  onChange={e => setVal("ownerId", e.target.value)}
                >
                  <option value="">یک کاربر را انتخاب کنید...</option>
                  {filteredUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.phone || user.email} {user.phone ? `(${user.email})` : ""}
                    </option>
                  ))}
                </QFSelect>
                <small style={{ color: "var(--muted)", fontSize: "0.72rem" }}>رمز عبور و اطلاعات ورود فعلی این کاربر بدون تغییر باقی می‌مانند.</small>
              </div>
            ) : (
              // Mode: New User
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <QFInput
                  label="شماره موبایل مدیر"
                  required
                  value={form.ownerPhone}
                  onChange={e => setVal("ownerPhone", e.target.value)}
                  placeholder="09123456789"
                />
                <QFInput
                  label="ایمیل مدیر (اختیاری)"
                  type="email"
                  value={form.ownerEmail}
                  onChange={e => setVal("ownerEmail", e.target.value)}
                  placeholder="owner@example.com"
                />
                <div style={{ gridColumn: "1/-1" }}>
                  <QFInput
                    label="رمز عبور اولیه"
                    required
                    minLength={8}
                    type="password"
                    value={form.ownerPassword}
                    onChange={e => setVal("ownerPassword", e.target.value)}
                    placeholder="حداقل ۸ کاراکتر"
                  />
                </div>
                <p style={{ gridColumn: "1/-1", color: "var(--muted)", fontSize: "0.72rem", margin: 0 }}>
                  اگر شماره موبایل وارد شده از قبل وجود داشته باشد، همان حساب مالک شده و کلمه عبور آن تغییر نخواهد کرد.
                </p>
              </div>
            )}
          </article>

          {/* Step 2: Gym Info */}
          <article className="qf-plans-table-card" style={{ padding: "24px" }}>
            <div className="qf-step-title" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <b style={{ background: "#7e3df2", color: "#fff", width: "28px", height: "28px", borderRadius: "8px", display: "grid", placeItems: "center", fontSize: "0.85rem" }}>۲</b>
              <div>
                <h2 style={{ fontSize: "1.05rem", margin: 0 }}>مشخصات و آدرس اختصاصی باشگاه</h2>
                <p style={{ fontSize: "0.76rem", color: "var(--muted)", margin: 0 }}>دامنه، موقعیت جغرافیایی و متراژ حدودی مجموعه را ثبت کنید.</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ gridColumn: "1/-1" }}>
                <QFInput
                  label="نام باشگاه"
                  required
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="مثال: باشگاه انرژی و تندرستی تهران"
                />
              </div>

              <QFInput
                label="شناسه انگلیسی یکتا (Slug)"
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                value={form.slug}
                onChange={e => setVal("slug", e.target.value)}
                placeholder={suggestedSlug || "energy-gym"}
                hint="فقط حروف انگلیسی کوچک، اعداد و خط تیره"
              />

              <QFInput
                label="ساب‌دامین اختصاصی"
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                value={form.subdomain}
                onChange={e => setVal("subdomain", e.target.value)}
                placeholder={form.slug || suggestedSlug || "energy-gym"}
              />

              <QFInput
                label="موقعیت مجموعه"
                required
                value={form.location}
                onChange={e => setVal("location", e.target.value)}
                placeholder="تهران، شهرک غرب"
              />

              <QFSelect
                label="نوع کاربری"
                value={form.gymType}
                onChange={e => setVal("gymType", e.target.value)}
              >
                <option value="mixed">عمومی / مختلط</option>
                <option value="male">مخصوص آقایان</option>
                <option value="female">مخصوص بانوان</option>
              </QFSelect>

              <div style={{ gridColumn: "1/-1" }}>
                <QFInput
                  label="مساحت سالن (متر مربع)"
                  type="number"
                  min="0"
                  value={form.sizeSqm}
                  onChange={e => setVal("sizeSqm", e.target.value)}
                  placeholder="مثال: ۳۵۰"
                />
              </div>
            </div>
          </article>

          {/* Step 3: Plan */}
          <article className="qf-plans-table-card" style={{ padding: "24px" }}>
            <div className="qf-step-title" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <b style={{ background: "#7e3df2", color: "#fff", width: "28px", height: "28px", borderRadius: "8px", display: "grid", placeItems: "center", fontSize: "0.85rem" }}>۳</b>
              <div>
                <h2 style={{ fontSize: "1.05rem", margin: 0 }}>اشتراک و دسترسی‌های اولیه</h2>
                <p style={{ fontSize: "0.76rem", color: "var(--muted)", margin: 0 }}>پلن انتخابی تعیین‌کننده سقف مجاز ثبت نام مربی، اعضا و ابزارهای باشگاه است.</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              {plans.map(plan => {
                const isSelected = form.planCode === plan.code;
                return (
                  <label
                    key={plan.code}
                    style={{
                      display: "flex", flexDirection: "column", gap: "8px", padding: "16px",
                      borderRadius: "16px", border: "1px solid", cursor: "pointer", transition: "all 0.15s ease",
                      borderColor: isSelected ? "#7e3df2" : "var(--border)",
                      background: isSelected ? "rgba(126,61,242,0.06)" : "rgba(255,255,255,0.01)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="radio"
                        name="plan"
                        value={plan.code}
                        checked={isSelected}
                        onChange={e => setVal("planCode", e.target.value)}
                        style={{ accentColor: "#7e3df2" }}
                      />
                      <strong style={{ fontSize: "0.88rem", color: isSelected ? "#a272ff" : "var(--text)" }}>{plan.name}</strong>
                    </div>
                    <span style={{ fontSize: "0.74rem", color: "var(--muted)", paddingRight: "22px" }}>
                      {plan.monthlyPrice ? `${plan.monthlyPrice.toLocaleString("fa-IR")} ${plan.currency || "USD"}/ماه` : "پلن پایه"}
                    </span>
                  </label>
                );
              })}
            </div>
          </article>
        </div>

        {/* Aside Summary Column */}
        <aside className="qf-plans-table-card" style={{ padding: "24px", position: "sticky", top: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "#a272ff", fontWeight: "bold", textTransform: "uppercase" }}>پیش‌نمایش باشگاه</span>
            <h3 style={{ fontSize: "1.15rem", margin: "6px 0 0 0", color: "#fff" }}>{form.name || "مجموعه ورزشی جدید"}</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ color: "var(--muted)" }}>مالک اصلی:</span>
              <strong style={{ color: "var(--text)" }}>
                {ownerMode === "existing"
                  ? (users.find(x => x.id === form.ownerId)?.phone || "انتخاب نشده")
                  : (form.ownerPhone || "ثبت نشده")}
              </strong>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ color: "var(--muted)" }}>پلن مالی:</span>
              <strong style={{ color: "#a272ff" }}>
                {plans.find(x => x.code === form.planCode)?.name || form.planCode}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ color: "var(--muted)" }}>نوع سالن:</span>
              <strong style={{ color: "var(--text)" }}>
                {form.gymType === "mixed" ? "عمومی" : form.gymType === "male" ? "آقایان" : "بانوان"}
              </strong>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.8rem", borderTop: "1px dashed var(--border)", paddingTop: "10px" }}>
              <span style={{ color: "var(--muted)" }}>آدرس ساب‌دامین اختصاصی:</span>
              <code style={{ fontSize: "0.74rem", color: "#5a78ff", direction: "ltr", textAlign: "right" }}>
                {form.subdomain || form.slug || suggestedSlug || "gym"}.quantumfit.ir
              </code>
            </div>
          </div>

          <button
            type="submit"
            className="qf-btn qf-btn-primary"
            style={{ width: "100%", padding: "12px" }}
            disabled={submitting}
          >
            {submitting ? "در حال ثبت اطلاعات..." : "ساخت و فعال‌سازی باشگاه"}
          </button>

          {message && (
            <p style={{
              margin: 0, padding: "10px 14px", borderRadius: "10px", fontSize: "0.78rem", textAlign: "center",
              background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)"
            }}>
              {message}
            </p>
          )}
        </aside>

      </form>
    </section>
  );
}
