"use client";

import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "marketing",
  },
});

type Plan = {
  code: string;
  name: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  currency?: string;
  limits?: Record<string, unknown>;
};

type Quote = {
  planCode: string;
  billingCycle: string;
  currency: string;
  basePrice: number;
  customerDiscount: number;
  couponDiscount: number;
  finalPrice: number;
};

export default function Page() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [couponCode, setCouponCode] = useState("");
  const [gymId, setGymId] = useState("");
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: Plan[] }>("/api/v1/plans");
        if (mounted) {
          setPlans(payload.items ?? []);
        }
      } catch {
        if (mounted) {
          setPlans([]);
        }
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadQuotes() {
      const next: Record<string, Quote> = {};
      await Promise.all(
        plans.map(async (plan) => {
          try {
            const query = new URLSearchParams({
              planCode: plan.code,
              billingCycle,
            });
            if (gymId.trim()) {
              query.set("gymId", gymId.trim());
            }
            if (couponCode.trim()) {
              query.set("couponCode", couponCode.trim());
            }
            const quote = await api.get<Quote>(`/api/v1/public/pricing/quote?${query.toString()}`);
            next[plan.code] = quote;
          } catch {
            const basePrice = billingCycle === "yearly" ? (plan.yearlyPrice ?? 0) : (plan.monthlyPrice ?? 0);
            next[plan.code] = {
              planCode: plan.code,
              billingCycle,
              currency: plan.currency ?? "USD",
              basePrice,
              customerDiscount: 0,
              couponDiscount: 0,
              finalPrice: basePrice,
            };
          }
        }),
      );
      if (mounted) {
        setQuotes(next);
      }
    }
    void loadQuotes();
    return () => {
      mounted = false;
    };
  }, [billingCycle, couponCode, gymId, plans]);

  const activePlans = useMemo(() => plans, [plans]);

  return (
    <section className="page-section">
      <span className="kicker">Pricing</span>
      <h1>Pricing shaped by the admin panel, coupons, and customer-specific offers.</h1>
      <p>Monthly or yearly pricing is rendered live from PostgreSQL, then adjusted by discounts and coupon rules.</p>

      <div className="auth-grid" style={{ marginTop: 24 }}>
        <div className="form-card">
          <div className="form-field">
            <label>Billing cycle</label>
            <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as "monthly" | "yearly")}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="form-field">
            <label>Gym ID for customer discount</label>
            <input value={gymId} onChange={(e) => setGymId(e.target.value)} placeholder="Optional gym UUID" />
          </div>
          <div className="form-field">
            <label>Coupon code</label>
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Optional coupon" />
          </div>
          <div className="actions">
            <a className="button primary" href="/demo">Request demo</a>
            <a className="button secondary" href="/login">Login</a>
          </div>
        </div>
        <div className="flow-card">
          <h3>Discount order</h3>
          <div className="stepper">
            <div><strong>1</strong><span>Base plan price</span></div>
            <div><strong>2</strong><span>Customer-specific discount</span></div>
            <div><strong>3</strong><span>Coupon validation</span></div>
            <div><strong>4</strong><span>Final price preview</span></div>
          </div>
        </div>
      </div>

      <div className="copy-grid" style={{ marginTop: 24 }}>
        {activePlans.length > 0 ? activePlans.map((plan) => {
          const quote = quotes[plan.code];
          return (
            <article key={plan.code}>
              <h3>{plan.name}</h3>
              <p>{plan.currency ?? "USD"} {quote?.finalPrice ?? (billingCycle === "yearly" ? plan.yearlyPrice ?? 0 : plan.monthlyPrice ?? 0)} · {billingCycle}</p>
              <p style={{ color: "var(--muted)" }}>
                Base: {quote?.basePrice ?? 0} · Customer discount: {quote?.customerDiscount ?? 0} · Coupon: {quote?.couponDiscount ?? 0}
              </p>
              <p>
                {(Object.entries(plan.limits ?? {})
                  .map(([key, value]) => `${key}: ${String(value)}`)
                  .join(" · ") || "Configured from admin panel." )}
              </p>
            </article>
          );
        }) : (
          <article>
            <h3>No plans loaded</h3>
            <p>Connect the backend and database to see live pricing data from the admin panel.</p>
          </article>
        )}
      </div>
    </section>
  );
}
