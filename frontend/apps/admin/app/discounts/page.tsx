"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type Discount = {
  id: string;
  gymId: string;
  gymName?: string;
  planCode: string;
  discountType: string;
  discountValue: number;
  durationMonths: number;
  reason: string;
  isActive: boolean;
  stackable: boolean;
};

type Gym = { id: string; name: string; slug: string };
type Plan = { code: string; name: string; monthlyPrice?: number; currency?: string };

export default function Page() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    gymId: "",
    planCode: "",
    discountType: "percent",
    discountValue: 20,
    durationMonths: 10,
    reason: "",
    stackable: false,
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [discountPayload, gymPayload, planPayload] = await Promise.all([
          api.get<{ items: Discount[] }>("/api/v1/admin/customer-discounts"),
          api.get<{ items: Gym[] }>("/api/v1/admin/gyms"),
          api.get<{ items: Plan[] }>("/api/v1/plans"),
        ]);
        if (!mounted) {
          return;
        }
        setDiscounts(discountPayload.items ?? []);
        setGyms(gymPayload.items ?? []);
        setPlans(planPayload.items ?? []);
      } catch {
        if (mounted) {
          setDiscounts([]);
          setGyms([]);
          setPlans([]);
        }
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function createDiscount() {
    setMessage("");
    try {
      const created = await api.post<Discount>("/api/v1/admin/customer-discounts", {
        gymId: form.gymId,
        planCode: form.planCode,
        discountType: form.discountType,
        discountValue: form.discountValue,
        durationMonths: form.durationMonths,
        reason: form.reason,
        stackable: form.stackable,
      });
      setDiscounts((current) => [created, ...current]);
      setMessage("Discount saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save discount.");
    }
  }

  async function removeDiscount(id: string) {
    await api.delete(`/api/v1/admin/customer-discounts/${id}`);
    setDiscounts((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">Customer discounts</span>
        <h1>Gym-specific pricing offers with audit-ready control.</h1>
        <p>Apply a custom discount to one gym and one plan for a fixed number of months.</p>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Create discount</span><em>Admin only</em></div>
          <div className="field-list">
            <div className="form-field">
              <label>Gym</label>
              <select value={form.gymId} onChange={(e) => setForm({ ...form, gymId: e.target.value })}>
                <option value="">Select gym</option>
                {gyms.map((gym) => <option key={gym.id} value={gym.id}>{gym.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Plan</label>
              <select value={form.planCode} onChange={(e) => setForm({ ...form, planCode: e.target.value })}>
                <option value="">Select plan</option>
                {plans.map((plan) => <option key={plan.code} value={plan.code}>{plan.name} {plan.currency ? `· ${plan.currency}` : ""}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Discount type</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            <div className="form-field">
              <label>Discount value</label>
              <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
            </div>
            <div className="form-field">
              <label>Duration months</label>
              <input type="number" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })} />
            </div>
            <div className="form-field">
              <label>Reason</label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
            <label className="form-field" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" checked={form.stackable} onChange={(e) => setForm({ ...form, stackable: e.target.checked })} />
              <span>Stackable with coupon</span>
            </label>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createDiscount} disabled={!form.gymId || !form.planCode}>Save discount</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>

        <section className="panel">
          <div className="section-head"><span>Active discounts</span><em>{discounts.length} records</em></div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>Gym</strong>
              <strong>Plan</strong>
              <strong>Value</strong>
              <strong>Action</strong>
            </div>
            {discounts.length > 0 ? discounts.map((discount) => (
              <div className="qf-table__row" key={discount.id}>
                <span>{discount.gymName ?? discount.gymId}</span>
                <span>{discount.planCode}</span>
                <span>{discount.discountType} · {discount.discountValue}</span>
                <button className="button secondary" type="button" onClick={() => removeDiscount(discount.id)}>Delete</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>No discounts yet</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
