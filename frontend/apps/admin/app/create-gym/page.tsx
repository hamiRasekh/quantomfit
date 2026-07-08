"use client";

import { useMemo, useState, type FormEvent } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type FormState = {
  name: string;
  slug: string;
  subdomain: string;
  planCode: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerPhone: string;
  gymType: string;
  location: string;
  sizeSqm: string;
  timezone: string;
};

const initialState: FormState = {
  name: "",
  slug: "",
  subdomain: "",
  planCode: "growth",
  ownerEmail: "",
  ownerPassword: "",
  ownerPhone: "",
  gymType: "mixed",
  location: "",
  sizeSqm: "",
  timezone: "Asia/Tehran",
};

export default function Page() {
  const [form, setForm] = useState<FormState>(initialState);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const derivedSubdomain = useMemo(() => {
    const base = form.subdomain.trim() || form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, "-");
    return base || "gym";
  }, [form.name, form.slug, form.subdomain]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const payload = await api.post<{ gym: { name: string; slug: string; subdomain: string } }>("/api/v1/admin/gyms", {
        ...form,
        sizeSqm: Number(form.sizeSqm),
      });
      setMessage(`باشگاه ساخته شد: ${payload.gym.name} (${payload.gym.slug} روی ${payload.gym.subdomain}.quantumfit.ir)`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ساخت باشگاه ممکن نشد");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">ثبت باشگاه</span>
        <h1>یک مستاجر جدید بساز، دسترسی بده و ساب‌دامین تولید کن.</h1>
        <p>
          ادمین کل، حساب مالک اولیه را می‌سازد، پلن را انتخاب می‌کند و ویزارد راه‌اندازی را در یک جریان آماده می‌کند.
        </p>
      </header>

      <div className="auth-grid">
        <form className="form-card" onSubmit={onSubmit}>
          <div className="form-field"><label>نام باشگاه</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="QuantumFit Central" /></div>
          <div className="form-field"><label>اسلاگ</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="quantumfit-central" /></div>
          <div className="form-field"><label>ساب‌دامین</label><input value={form.subdomain} onChange={(e) => setForm({ ...form, subdomain: e.target.value })} placeholder={derivedSubdomain} /></div>
          <div className="form-field"><label>ایمیل مالک</label><input value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} placeholder="owner@quantumfit.ir" /></div>
          <div className="form-field"><label>رمز موقت</label><input type="password" value={form.ownerPassword} onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })} placeholder="رمز موقت" /></div>
          <div className="form-field"><label>پلن</label><select value={form.planCode} onChange={(e) => setForm({ ...form, planCode: e.target.value })}><option value="starter">starter</option><option value="growth">growth</option><option value="enterprise">enterprise</option></select></div>
          <div className="form-field"><label>نوع باشگاه</label><select value={form.gymType} onChange={(e) => setForm({ ...form, gymType: e.target.value })}><option value="male">مردانه</option><option value="female">زنانه</option><option value="mixed">مختلط</option></select></div>
          <div className="form-field"><label>موقعیت</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="تهران، ولیعصر" /></div>
          <div className="form-field"><label>مساحت (متر مربع)</label><input value={form.sizeSqm} onChange={(e) => setForm({ ...form, sizeSqm: e.target.value })} placeholder="1200" /></div>
          <div className="form-field"><label>منطقه زمانی</label><input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></div>
          <div className="actions">
            <button className="button primary" type="submit" disabled={submitting}>{submitting ? "در حال ساخت..." : "ساخت باشگاه"}</button>
            <a className="button secondary" href="/">لغو</a>
          </div>
          {message ? <p>{message}</p> : null}
        </form>
        <aside className="flow-card">
          <h3>جریان آماده‌سازی</h3>
          <div className="stepper">
            <div><strong>1</strong><span>ثبت رکورد مستاجر</span></div>
            <div><strong>2</strong><span>ساخت حساب مالک</span></div>
            <div><strong>3</strong><span>اتصال پلن و سقف‌ها</span></div>
            <div><strong>4</strong><span>فعال‌سازی ویزارد راه‌اندازی</span></div>
          </div>
          <p style={{ color: "var(--muted)", lineHeight: 1.7, marginTop: 16 }}>
            ساب‌دامین تولیدشده برای پنل باشگاه و اولین ورود استفاده می‌شود.
          </p>
        </aside>
      </div>
    </section>
  );
}
