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
      setMessage(`Gym created: ${payload.gym.name} (${payload.gym.slug} on ${payload.gym.subdomain}.quantumfit.ir)`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create gym");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">Create gym</span>
        <h1>Create a new tenant, assign access, and generate a subdomain.</h1>
        <p>
          Super admin issues the first owner account, selects the plan, and prepares the onboarding wizard in one flow.
        </p>
      </header>

      <div className="auth-grid">
        <form className="form-card" onSubmit={onSubmit}>
          <div className="form-field"><label>Gym name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="QuantumFit Central" /></div>
          <div className="form-field"><label>Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="quantumfit-central" /></div>
          <div className="form-field"><label>Subdomain</label><input value={form.subdomain} onChange={(e) => setForm({ ...form, subdomain: e.target.value })} placeholder={derivedSubdomain} /></div>
          <div className="form-field"><label>Owner email</label><input value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} placeholder="owner@quantumfit.ir" /></div>
          <div className="form-field"><label>Temporary password</label><input type="password" value={form.ownerPassword} onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })} placeholder="Temp password" /></div>
          <div className="form-field"><label>Plan</label><select value={form.planCode} onChange={(e) => setForm({ ...form, planCode: e.target.value })}><option value="starter">starter</option><option value="growth">growth</option><option value="enterprise">enterprise</option></select></div>
          <div className="form-field"><label>Gym type</label><select value={form.gymType} onChange={(e) => setForm({ ...form, gymType: e.target.value })}><option value="male">male</option><option value="female">female</option><option value="mixed">mixed</option></select></div>
          <div className="form-field"><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Tehran, Valiasr Street" /></div>
          <div className="form-field"><label>Size (sqm)</label><input value={form.sizeSqm} onChange={(e) => setForm({ ...form, sizeSqm: e.target.value })} placeholder="1200" /></div>
          <div className="form-field"><label>Timezone</label><input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></div>
          <div className="actions">
            <button className="button primary" type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create gym"}</button>
            <a className="button secondary" href="/">Cancel</a>
          </div>
          {message ? <p>{message}</p> : null}
        </form>
        <aside className="flow-card">
          <h3>Provisioning flow</h3>
          <div className="stepper">
            <div><strong>1</strong><span>Write tenant row</span></div>
            <div><strong>2</strong><span>Create owner login</span></div>
            <div><strong>3</strong><span>Attach plan and limits</span></div>
            <div><strong>4</strong><span>Enable onboarding wizard</span></div>
          </div>
          <p style={{ color: "var(--muted)", lineHeight: 1.7, marginTop: 16 }}>
            The generated subdomain will be used for the gym panel and the first login flow.
          </p>
        </aside>
      </div>
    </section>
  );
}
