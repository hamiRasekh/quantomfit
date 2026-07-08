"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type Coupon = {
  code: string;
  discountType: string;
  discountValue: number;
  applicablePlanCode?: string;
  panelType?: string;
  firstPurchaseOnly?: boolean;
  usageLimit?: number;
  usagePerCustomer?: number;
  stackable?: boolean;
  description?: string;
  internalNote?: string;
  isActive?: boolean;
};

export default function Page() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    code: "",
    discountType: "percent",
    discountValue: 10,
    applicablePlanCode: "",
    panelType: "",
    firstPurchaseOnly: false,
    usageLimit: 0,
    usagePerCustomer: 0,
    stackable: true,
    description: "",
    internalNote: "",
  });

  useEffect(() => {
    let mounted = true;
    api.get<{ items: Coupon[] }>("/api/v1/coupons")
      .then((payload) => {
        if (mounted) {
          setCoupons(payload.items ?? []);
        }
      })
      .catch(() => {
        if (mounted) {
          setCoupons([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function save() {
    setMessage("");
    try {
      const created = await api.post<Coupon>("/api/v1/admin/coupons", form);
      setCoupons((current) => {
        const filtered = current.filter((item) => item.code !== created.code);
        return [created, ...filtered];
      });
      setMessage("کوپن ذخیره شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره کوپن ممکن نشد.");
    }
  }

  async function deactivate(code: string) {
    await api.delete(`/api/v1/admin/coupons/${code}`);
    setCoupons((current) => current.map((item) => (item.code === code ? { ...item, isActive: false } : item)));
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">کوپن‌ها</span>
        <h1>کدهای تخفیف با محدودیت پلن و منطق ترکیب‌پذیر.</h1>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>ساخت کوپن</span><em>فقط ادمین</em></div>
          <div className="field-list">
            <div className="form-field"><label>کد</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="WELCOME10" /></div>
            <div className="form-field"><label>نوع تخفیف</label><select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}><option value="percent">درصدی</option><option value="fixed">مبلغ ثابت</option></select></div>
            <div className="form-field"><label>مقدار تخفیف</label><input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} /></div>
            <div className="form-field"><label>پلن مرتبط</label><input value={form.applicablePlanCode} onChange={(e) => setForm({ ...form, applicablePlanCode: e.target.value })} /></div>
            <div className="form-field"><label>نوع پنل</label><input value={form.panelType} onChange={(e) => setForm({ ...form, panelType: e.target.value })} placeholder="gym / coach / app" /></div>
            <div className="form-field"><label>سقف استفاده</label><input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} /></div>
            <div className="form-field"><label>برای هر مشتری</label><input type="number" value={form.usagePerCustomer} onChange={(e) => setForm({ ...form, usagePerCustomer: Number(e.target.value) })} /></div>
            <div className="form-field"><label>توضیح</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-field"><label>یادداشت داخلی</label><input value={form.internalNote} onChange={(e) => setForm({ ...form, internalNote: e.target.value })} /></div>
            <label className="form-field" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" checked={form.firstPurchaseOnly} onChange={(e) => setForm({ ...form, firstPurchaseOnly: e.target.checked })} />
              <span>فقط خرید اول</span>
            </label>
            <label className="form-field" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" checked={form.stackable} onChange={(e) => setForm({ ...form, stackable: e.target.checked })} />
              <span>قابل ترکیب</span>
            </label>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={save} disabled={!form.code.trim()}>ذخیره کوپن</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>

        <section className="panel">
          <div className="section-head"><span>کوپن‌ها</span><em>{coupons.length} رکورد</em></div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>کد</strong>
              <strong>مقدار</strong>
              <strong>محدوده</strong>
              <strong>عملیات</strong>
            </div>
            {coupons.length > 0 ? coupons.map((coupon) => (
              <div className="qf-table__row" key={coupon.code}>
                <span>
                  <strong>{coupon.code}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{coupon.description ?? "توضیحی ثبت نشده"}</small>
                </span>
                <span>{coupon.discountType} · {coupon.discountValue}</span>
                <span>{coupon.applicablePlanCode || "همه پلن‌ها"} · {coupon.panelType || "همه پنل‌ها"}</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="button secondary" type="button" onClick={() => deactivate(coupon.code)}>غیرفعال</button>
                </div>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>کوپنی پیدا نشد</span>
                <span>جدول را</span>
                <span>از بک‌اند پر کن</span>
                <span>—</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
