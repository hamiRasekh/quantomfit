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
      setMessage("تخفیف ذخیره شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره تخفیف ممکن نشد.");
    }
  }

  async function removeDiscount(id: string) {
    await api.delete(`/api/v1/admin/customer-discounts/${id}`);
    setDiscounts((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">تخفیف‌ها</span>
        <h1>پیشنهادهای قیمتی مخصوص هر باشگاه با کنترل قابل‌ردیابی.</h1>
        <p>برای یک باشگاه و یک پلن، تخفیف اختصاصی را برای مدت مشخص اعمال کن.</p>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>ساخت تخفیف</span><em>فقط ادمین</em></div>
          <div className="field-list">
            <div className="form-field">
              <label>باشگاه</label>
              <select value={form.gymId} onChange={(e) => setForm({ ...form, gymId: e.target.value })}>
                <option value="">انتخاب باشگاه</option>
                {gyms.map((gym) => <option key={gym.id} value={gym.id}>{gym.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>پلن</label>
              <select value={form.planCode} onChange={(e) => setForm({ ...form, planCode: e.target.value })}>
                <option value="">انتخاب پلن</option>
                {plans.map((plan) => <option key={plan.code} value={plan.code}>{plan.name} {plan.currency ? `· ${plan.currency}` : ""}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>نوع تخفیف</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="percent">درصدی</option>
                <option value="fixed">مبلغ ثابت</option>
              </select>
            </div>
            <div className="form-field">
              <label>مقدار تخفیف</label>
              <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
            </div>
            <div className="form-field">
              <label>مدت ماه</label>
              <input type="number" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })} />
            </div>
            <div className="form-field">
              <label>دلیل</label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
            <label className="form-field" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" checked={form.stackable} onChange={(e) => setForm({ ...form, stackable: e.target.checked })} />
              <span>قابل ترکیب با کوپن</span>
            </label>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createDiscount} disabled={!form.gymId || !form.planCode}>ذخیره تخفیف</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>

        <section className="panel">
          <div className="section-head"><span>تخفیف‌های فعال</span><em>{discounts.length} رکورد</em></div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>باشگاه</strong>
              <strong>پلن</strong>
              <strong>مقدار</strong>
              <strong>عملیات</strong>
            </div>
            {discounts.length > 0 ? discounts.map((discount) => (
              <div className="qf-table__row" key={discount.id}>
                <span>{discount.gymName ?? discount.gymId}</span>
                <span>{discount.planCode}</span>
                <span>{discount.discountType} · {discount.discountValue}</span>
                <button className="button secondary" type="button" onClick={() => removeDiscount(discount.id)}>حذف</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>هنوز تخفیفی ثبت نشده</span>
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
