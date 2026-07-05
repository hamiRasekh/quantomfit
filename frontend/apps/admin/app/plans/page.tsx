"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type Plan = {
  code: string;
  name: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  currency?: string;
  description?: string;
  limits?: Record<string, unknown>;
  isActive?: boolean;
};

export default function Page() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    code: "",
    name: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "USD",
    description: "",
    limitsText: JSON.stringify({ gyms: 1, members: 250, trainers: 5 }, null, 2),
  });

  useEffect(() => {
    let mounted = true;
    api.get<{ items: Plan[] }>("/api/v1/plans")
      .then((payload) => {
        if (mounted) {
          setPlans(payload.items ?? []);
        }
      })
      .catch(() => {
        if (mounted) {
          setPlans([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function save() {
    setMessage("");
    const limits = JSON.parse(form.limitsText || "{}");
    const payload = {
      code: form.code,
      name: form.name,
      monthlyPrice: form.monthlyPrice,
      yearlyPrice: form.yearlyPrice,
      currency: form.currency,
      description: form.description,
      limits,
    };
    try {
      const created = await api.post<Plan>("/api/v1/admin/plans", payload);
      setPlans((current) => {
        const filtered = current.filter((item) => item.code !== created.code);
        return [created, ...filtered];
      });
      setMessage("Plan saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save plan.");
    }
  }

  async function edit(plan: Plan) {
    const updated = await api.patch<Plan>(`/api/v1/admin/plans/${plan.code}`, {
      name: plan.name,
      monthlyPrice: plan.monthlyPrice ?? 0,
      yearlyPrice: plan.yearlyPrice ?? 0,
      currency: plan.currency ?? "USD",
      description: plan.description ?? "",
      limits: plan.limits ?? {},
      active: plan.isActive,
    });
    setPlans((current) => current.map((item) => (item.code === updated.code ? updated : item)));
  }

  async function deactivate(code: string) {
    await api.delete(`/api/v1/admin/plans/${code}`);
    setPlans((current) => current.map((item) => (item.code === code ? { ...item, isActive: false } : item)));
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">Plans</span>
        <h1>Subscription plans fully editable from PostgreSQL.</h1>
        <p>Plans define monthly and yearly pricing, limits, and visibility across the website and panels.</p>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Create or update plan</span><em>Admin only</em></div>
          <div className="field-list">
            <div className="form-field"><label>Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="growth" /></div>
            <div className="form-field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Growth" /></div>
            <div className="form-field"><label>Monthly price</label><input type="number" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) })} /></div>
            <div className="form-field"><label>Yearly price</label><input type="number" value={form.yearlyPrice} onChange={(e) => setForm({ ...form, yearlyPrice: Number(e.target.value) })} /></div>
            <div className="form-field"><label>Currency</label><input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
            <div className="form-field"><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-field"><label>Limits JSON</label><textarea rows={6} value={form.limitsText} onChange={(e) => setForm({ ...form, limitsText: e.target.value })} /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={save}>Save plan</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>

        <section className="panel">
          <div className="section-head"><span>Active plans</span><em>{plans.length} records</em></div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>Plan</strong>
              <strong>Pricing</strong>
              <strong>Status</strong>
              <strong>Action</strong>
            </div>
            {plans.length > 0 ? plans.map((plan) => (
              <div className="qf-table__row" key={plan.code}>
                <span>
                  <strong>{plan.name}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{plan.code}</small>
                </span>
                <span>{plan.currency ?? "USD"} {plan.monthlyPrice ?? 0}/mo · {plan.yearlyPrice ?? 0}/yr</span>
                <span>{plan.isActive ? "active" : "inactive"}</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="button secondary" type="button" onClick={() => edit(plan)}>Update</button>
                  <button className="button secondary" type="button" onClick={() => deactivate(plan.code)}>Deactivate</button>
                </div>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>No plans found</span>
                <span>Seed the pricing table</span>
                <span>from backend</span>
                <span>—</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
