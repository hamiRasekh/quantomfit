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
  { key: "gym_name", label: "Gym name", hint: "Brand and public identity" },
  { key: "gym_type", label: "Gym type", hint: "Male, female, or mixed" },
  { key: "location", label: "Location", hint: "City and full address" },
  { key: "size", label: "Size", hint: "Square meters and floors" },
  { key: "brand_assets", label: "Brand assets", hint: "Logo and gallery images" },
  { key: "contact", label: "Contact info", hint: "Phone, email, and social links" },
  { key: "hours", label: "Working hours", hint: "Open and close schedule" },
  { key: "equipment", label: "Equipment list", hint: "Comma separated inventory" },
  { key: "trainers", label: "Trainer count", hint: "Initial trainer count" },
  { key: "review", label: "Review", hint: "Confirm and activate" },
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
          setMessage("Unable to load onboarding state.");
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
      setMessage(completed ? "Gym activated successfully." : "Step saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save onboarding step.");
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
          <span className="label">Onboarding Wizard</span>
          <h1>Loading onboarding state...</h1>
        </header>
      </section>
    );
  }

  const summaryItems = [
    { label: "Gym name", value: form.gymName || "Not set" },
    { label: "Gym type", value: form.gymType || "Not set" },
    { label: "Location", value: form.location || "Not set" },
    { label: "Size", value: form.sizeSqm ? `${form.sizeSqm} sqm` : "Not set" },
    { label: "Trainers", value: form.trainerCount || "0" },
  ];

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Onboarding Wizard</span>
        <h1>Complete the gym setup to activate the panel.</h1>
        <p>Status: {state?.status ?? "created"} · step: {state?.step ?? currentStep.key}</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>{currentStep.label}</span>
            <em>{completedStepCount}/{steps.length}</em>
          </div>
          <p style={{ color: "var(--text-muted)", marginTop: 0 }}>{currentStep.hint}</p>
          {stepIndex === 0 ? <div className="form-field"><label>Gym name</label><input value={form.gymName} onChange={(e) => setForm({ ...form, gymName: e.target.value })} placeholder="QuantumFit Central" /></div> : null}
          {stepIndex === 1 ? <div className="form-field"><label>Gym type</label><select value={form.gymType} onChange={(e) => setForm({ ...form, gymType: e.target.value })}><option value="male">male</option><option value="female">female</option><option value="mixed">mixed</option></select></div> : null}
          {stepIndex === 2 ? <div className="form-field"><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Tehran, Valiasr Street" /></div> : null}
          {stepIndex === 3 ? <div className="form-field"><label>Size (sqm)</label><input value={form.sizeSqm} onChange={(e) => setForm({ ...form, sizeSqm: e.target.value })} placeholder="1200" /></div> : null}
          {stepIndex === 4 ? (
            <>
              <div className="form-field"><label>Logo URL</label><input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." /></div>
              <div className="form-field"><label>Image URLs</label><input value={form.imageUrls} onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} placeholder="Comma separated URLs" /></div>
            </>
          ) : null}
          {stepIndex === 5 ? <div className="form-field"><label>Contact info</label><input value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} placeholder="+98..." /></div> : null}
          {stepIndex === 6 ? <div className="form-field"><label>Working hours</label><input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} placeholder="Sat-Thu 08:00 - 22:00" /></div> : null}
          {stepIndex === 7 ? <div className="form-field"><label>Equipment list</label><input value={form.equipmentList} onChange={(e) => setForm({ ...form, equipmentList: e.target.value })} placeholder="Treadmill, Bench Press, Rowing Machine" /></div> : null}
          {stepIndex === 8 ? <div className="form-field"><label>Trainer count</label><input value={form.trainerCount} onChange={(e) => setForm({ ...form, trainerCount: e.target.value })} placeholder="4" /></div> : null}
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
                Review the data before activation. After confirmation, the gym panel becomes active.
              </p>
            </div>
          ) : null}
          <div className="actions">
            <button className="button secondary" type="button" onClick={back} disabled={stepIndex === 0 || saving}>Back</button>
            <button className="button primary" type="button" onClick={next} disabled={saving}>
              {saving ? "Saving..." : stepIndex === steps.length - 1 ? "Activate gym" : "Save and continue"}
            </button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>
        <aside className="panel">
          <div className="section-head">
            <span>Setup steps</span>
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
            {currentStep.label} is the active step. Data is saved to PostgreSQL on each continue.
          </p>
          <div className="stepper">
            <div><strong>Current</strong><span>{currentStep.label}</span></div>
            <div><strong>Gym</strong><span>{form.gymName || "unset"}</span></div>
            <div><strong>Trainer count</strong><span>{form.trainerCount || "unset"}</span></div>
            <div><strong>Images</strong><span>{form.imageUrls ? "ready" : "unset"}</span></div>
          </div>
        </aside>
      </div>
    </section>
  );
}
