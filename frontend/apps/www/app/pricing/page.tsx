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
      <span className="kicker">تعرفه‌ها</span>
      <h1>تعرفه‌ها از پنل ادمین، کوپن‌ها و تخفیف‌های اختصاصی ساخته می‌شوند.</h1>
      <p>قیمت ماهانه یا سالانه مستقیم از PostgreSQL خوانده می‌شود و با قوانین تخفیف و کوپن به‌روزرسانی می‌شود.</p>

      <div className="auth-grid" style={{ marginTop: 24 }}>
        <div className="form-card">
          <div className="form-field">
            <label>نوع پرداخت</label>
            <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as "monthly" | "yearly")}>
              <option value="monthly">ماهانه</option>
              <option value="yearly">سالانه</option>
            </select>
          </div>
          <div className="form-field">
            <label>شناسه باشگاه برای تخفیف اختصاصی</label>
            <input value={gymId} onChange={(e) => setGymId(e.target.value)} placeholder="UUID اختیاری" />
          </div>
          <div className="form-field">
            <label>کد کوپن</label>
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="اختیاری" />
          </div>
          <div className="actions">
            <a className="button primary" href="/demo">درخواست دمو</a>
            <a className="button secondary" href="/login">ورود</a>
          </div>
        </div>
        <div className="flow-card">
          <h3>ترتیب اعمال تخفیف</h3>
          <div className="stepper">
            <div><strong>1</strong><span>قیمت پایه پلن</span></div>
            <div><strong>2</strong><span>تخفیف اختصاصی مشتری</span></div>
            <div><strong>3</strong><span>اعتبارسنجی کوپن</span></div>
            <div><strong>4</strong><span>نمایش قیمت نهایی</span></div>
          </div>
        </div>
      </div>

      <div className="copy-grid" style={{ marginTop: 24 }}>
        {activePlans.length > 0 ? activePlans.map((plan) => {
          const quote = quotes[plan.code];
          return (
            <article key={plan.code}>
              <h3>{plan.name}</h3>
              <p>{plan.currency ?? "USD"} {quote?.finalPrice ?? (billingCycle === "yearly" ? plan.yearlyPrice ?? 0 : plan.monthlyPrice ?? 0)} · {billingCycle === "monthly" ? "ماهانه" : "سالانه"}</p>
              <p style={{ color: "var(--muted)" }}>
                پایه: {quote?.basePrice ?? 0} · تخفیف اختصاصی: {quote?.customerDiscount ?? 0} · کوپن: {quote?.couponDiscount ?? 0}
              </p>
              <p>
                {(Object.entries(plan.limits ?? {})
                  .map(([key, value]) => `${key}: ${String(value)}`)
                  .join(" · ") || "محدودیت‌ها از پنل ادمین تنظیم می‌شوند." )}
              </p>
            </article>
          );
        }) : (
          <article>
            <h3>پلنی لود نشده است</h3>
            <p>برای نمایش تعرفه‌های زنده، API و دیتابیس را اجرا کن.</p>
          </article>
        )}
      </div>
    </section>
  );
}
