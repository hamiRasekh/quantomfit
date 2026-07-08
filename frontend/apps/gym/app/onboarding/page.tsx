"use client";

import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type OnboardingState = {
  status?: string;
  step?: string;
  payload?: Record<string, unknown>;
  completedAt?: string;
};

type OnboardingForm = {
  gymName: string;
  gymType: string;
  location: string;
  sizeSqm: string;
  logoUrl: string;
  imageUrls: string;
  contactInfo: string;
  workingHours: string;
  equipmentList: string;
  trainerCount: string;
};

const steps = [
  { key: "gym_name", label: "نام باشگاه", hint: "هویت برند و عمومی" },
  { key: "gym_type", label: "نوع باشگاه", hint: "مردانه، زنانه یا مختلط" },
  { key: "location", label: "موقعیت", hint: "شهر و آدرس کامل" },
  { key: "size", label: "متراژ", hint: "مترمربع و تعداد طبقات" },
  { key: "brand_assets", label: "دارایی‌های برند", hint: "لوگو و تصاویر گالری" },
  { key: "contact", label: "اطلاعات تماس", hint: "تلفن، ایمیل و لینک‌های اجتماعی" },
  { key: "hours", label: "ساعات کاری", hint: "برنامه باز و بسته شدن" },
  { key: "equipment", label: "لیست تجهیزات", hint: "موجودی جداشده با ویرگول" },
  { key: "trainers", label: "تعداد مربی‌ها", hint: "تعداد اولیه مربی‌ها" },
  { key: "review", label: "بازبینی", hint: "تأیید و فعال‌سازی" },
];

const initialForm: OnboardingForm = {
  gymName: "",
  gymType: "mixed",
  location: "",
  sizeSqm: "",
  logoUrl: "",
  imageUrls: "",
  contactInfo: "",
  workingHours: "",
  equipmentList: "",
  trainerCount: "",
};

export default function Page() {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [form, setForm] = useState<OnboardingForm>(initialForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const payload = await api.get<OnboardingState>("/api/v1/onboarding/state");
        if (!mounted) {
          return;
        }
        setState(payload);
        const source = payload.payload ?? {};
        setForm({
          gymName: String(source.gymName ?? ""),
          gymType: String(source.gymType ?? "mixed"),
          location: String(source.location ?? ""),
          sizeSqm: String(source.sizeSqm ?? ""),
          logoUrl: String(source.logoUrl ?? ""),
          imageUrls: Array.isArray(source.imageUrls) ? (source.imageUrls as string[]).join(", ") : String(source.imageUrls ?? ""),
          contactInfo: String(source.contactInfo ?? ""),
          workingHours: String(source.workingHours ?? ""),
          equipmentList: Array.isArray(source.equipmentList) ? (source.equipmentList as string[]).join(", ") : String(source.equipmentList ?? ""),
          trainerCount: String(source.trainerCount ?? ""),
        });
        const savedStep = steps.findIndex((item) => item.key === payload.step);
        setStepIndex(savedStep >= 0 ? savedStep : 0);
      } catch {
        if (mounted) {
          setMessage("بارگذاری وضعیت راه‌اندازی ممکن نشد.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const payload = useMemo(() => {
    const imageUrls = form.imageUrls.split(",").map((item) => item.trim()).filter(Boolean);
    const equipmentList = form.equipmentList.split(",").map((item) => item.trim()).filter(Boolean);

    return {
      gymName: form.gymName,
      gymType: form.gymType,
      location: form.location,
      sizeSqm: Number(form.sizeSqm || 0),
      logoUrl: form.logoUrl,
      imageUrls,
      contactInfo: form.contactInfo,
      workingHours: form.workingHours,
      equipmentList,
      trainerCount: Number(form.trainerCount || 0),
    };
  }, [form]);

  async function persist(nextStepIndex: number, completed: boolean) {
    setSaving(true);
    setMessage("");
    try {
      const nextStep = steps[nextStepIndex]?.key ?? steps[steps.length - 1].key;
      const updated = await api.put<OnboardingState>("/api/v1/onboarding/state", {
        step: nextStep,
        payload,
        completed,
      });
      setState(updated);
      setStepIndex(nextStepIndex);
      setMessage(completed ? "باشگاه با موفقیت فعال شد." : "مرحله ذخیره شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره مرحله راه‌اندازی ممکن نشد.");
    } finally {
      setSaving(false);
    }
  }

  function next() {
    if (stepIndex >= steps.length - 1) {
      void persist(stepIndex, true);
      return;
    }
    void persist(stepIndex + 1, false);
  }

  function back() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  const currentStep = steps[stepIndex];
  const completedStepCount = Math.min(stepIndex + 1, steps.length);

  if (loading) {
    return (
      <section className="shell">
        <header className="hero">
          <span className="label">ویزارد راه‌اندازی</span>
          <h1>در حال بارگذاری وضعیت راه‌اندازی...</h1>
        </header>
      </section>
    );
  }

  const summaryItems = [
    { label: "نام باشگاه", value: form.gymName || "ثبت نشده" },
    { label: "نوع باشگاه", value: form.gymType || "ثبت نشده" },
    { label: "موقعیت", value: form.location || "ثبت نشده" },
    { label: "متراژ", value: form.sizeSqm ? `${form.sizeSqm} مترمربع` : "ثبت نشده" },
    { label: "مربی‌ها", value: form.trainerCount || "۰" },
  ];

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">ویزارد راه‌اندازی</span>
        <h1>راه‌اندازی باشگاه را کامل کن تا پنل فعال شود.</h1>
        <p>وضعیت: {state?.status ?? "created"} · مرحله: {state?.step ?? currentStep.key}</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>{currentStep.label}</span>
            <em>{completedStepCount}/{steps.length}</em>
          </div>
          <p style={{ color: "var(--text-muted)", marginTop: 0 }}>{currentStep.hint}</p>
          {stepIndex === 0 ? <div className="form-field"><label>نام باشگاه</label><input value={form.gymName} onChange={(e) => setForm({ ...form, gymName: e.target.value })} placeholder="کوانتوم‌فیت مرکزی" /></div> : null}
          {stepIndex === 1 ? <div className="form-field"><label>نوع باشگاه</label><select value={form.gymType} onChange={(e) => setForm({ ...form, gymType: e.target.value })}><option value="male">مردانه</option><option value="female">زنانه</option><option value="mixed">مختلط</option></select></div> : null}
          {stepIndex === 2 ? <div className="form-field"><label>موقعیت</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="تهران، خیابان ولیعصر" /></div> : null}
          {stepIndex === 3 ? <div className="form-field"><label>متراژ</label><input value={form.sizeSqm} onChange={(e) => setForm({ ...form, sizeSqm: e.target.value })} placeholder="1200" /></div> : null}
          {stepIndex === 4 ? (
            <>
              <div className="form-field"><label>آدرس لوگو</label><input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." /></div>
              <div className="form-field"><label>آدرس تصاویر</label><input value={form.imageUrls} onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} placeholder="آدرس‌ها با ویرگول جدا شوند" /></div>
            </>
          ) : null}
          {stepIndex === 5 ? <div className="form-field"><label>اطلاعات تماس</label><input value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} placeholder="+98..." /></div> : null}
          {stepIndex === 6 ? <div className="form-field"><label>ساعات کاری</label><input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} placeholder="شنبه تا پنج‌شنبه 08:00 - 22:00" /></div> : null}
          {stepIndex === 7 ? <div className="form-field"><label>لیست تجهیزات</label><input value={form.equipmentList} onChange={(e) => setForm({ ...form, equipmentList: e.target.value })} placeholder="تردمیل، پرس سینه، روئینگ" /></div> : null}
          {stepIndex === 8 ? <div className="form-field"><label>تعداد مربی‌ها</label><input value={form.trainerCount} onChange={(e) => setForm({ ...form, trainerCount: e.target.value })} placeholder="4" /></div> : null}
          {stepIndex === 9 ? (
            <div className="field-list">
              <div className="detail-grid">
                {summaryItems.map((item) => (
                  <article key={item.label}>
                    <span className="status">{item.label}</span>
                    <h3>{item.value}</h3>
                  </article>
                ))}
              </div>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                قبل از فعال‌سازی، داده‌ها را بازبینی کن. بعد از تأیید، پنل باشگاه فعال می‌شود.
              </p>
            </div>
          ) : null}
          <div className="actions">
            <button className="button secondary" type="button" onClick={back} disabled={stepIndex === 0 || saving}>قبلی</button>
            <button className="button primary" type="button" onClick={next} disabled={saving}>
              {saving ? "در حال ذخیره..." : stepIndex === steps.length - 1 ? "فعال‌سازی باشگاه" : "ذخیره و ادامه"}
            </button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>
        <aside className="panel">
          <div className="section-head">
            <span>مراحل راه‌اندازی</span>
            <em>{state?.status ?? "created"}</em>
          </div>
          <div className="stepper">
            {steps.map((step, index) => (
              <div key={step.key} style={{ opacity: index <= stepIndex ? 1 : 0.55 }}>
                <strong>{index + 1}</strong>
                <span>{step.label}</span>
              </div>
            ))}
          </div>
          <p style={{ color: "var(--text-muted)", marginTop: 16, lineHeight: 1.6 }}>
            {currentStep.label} مرحله‌ی فعال است. داده‌ها در هر ادامه در PostgreSQL ذخیره می‌شوند.
          </p>
          <div className="stepper">
            <div><strong>فعلی</strong><span>{currentStep.label}</span></div>
            <div><strong>باشگاه</strong><span>{form.gymName || "ثبت نشده"}</span></div>
            <div><strong>تعداد مربی</strong><span>{form.trainerCount || "ثبت نشده"}</span></div>
            <div><strong>تصاویر</strong><span>{form.imageUrls ? "آماده" : "ثبت نشده"}</span></div>
          </div>
        </aside>
      </div>
    </section>
  );
}
