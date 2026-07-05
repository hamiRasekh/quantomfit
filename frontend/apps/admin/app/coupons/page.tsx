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
      setMessage("Coupon saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save coupon.");
    }
  }

  async function deactivate(code: string) {
    await api.delete(`/api/v1/admin/coupons/${code}`);
    setCoupons((current) => current.map((item) => (item.code === code ? { ...item, isActive: false } : item)));
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">Coupons</span>
        <h1>Promo codes with plan restrictions and stackable logic.</h1>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Create coupon</span><em>Admin only</em></div>
          <div className="field-list">
            <div className="form-field"><label>Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="WELCOME10" /></div>
            <div className="form-field"><label>Discount type</label><select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}><option value="percent">Percentage</option><option value="fixed">Fixed</option></select></div>
            <div className="form-field"><label>Discount value</label><input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} /></div>
            <div className="form-field"><label>Applicable plan</label><input value={form.applicablePlanCode} onChange={(e) => setForm({ ...form, applicablePlanCode: e.target.value })} /></div>
            <div className="form-field"><label>Panel type</label><input value={form.panelType} onChange={(e) => setForm({ ...form, panelType: e.target.value })} placeholder="gym / coach / app" /></div>
            <div className="form-field"><label>Usage limit</label><input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} /></div>
            <div className="form-field"><label>Per customer</label><input type="number" value={form.usagePerCustomer} onChange={(e) => setForm({ ...form, usagePerCustomer: Number(e.target.value) })} /></div>
            <div className="form-field"><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-field"><label>Internal note</label><input value={form.internalNote} onChange={(e) => setForm({ ...form, internalNote: e.target.value })} /></div>
            <label className="form-field" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" checked={form.firstPurchaseOnly} onChange={(e) => setForm({ ...form, firstPurchaseOnly: e.target.checked })} />
              <span>First purchase only</span>
            </label>
            <label className="form-field" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" checked={form.stackable} onChange={(e) => setForm({ ...form, stackable: e.target.checked })} />
              <span>Stackable</span>
            </label>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={save} disabled={!form.code.trim()}>Save coupon</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>

        <section className="panel">
          <div className="section-head"><span>Coupons</span><em>{coupons.length} records</em></div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>Code</strong>
              <strong>Value</strong>
              <strong>Scope</strong>
              <strong>Action</strong>
            </div>
            {coupons.length > 0 ? coupons.map((coupon) => (
              <div className="qf-table__row" key={coupon.code}>
                <span>
                  <strong>{coupon.code}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{coupon.description ?? "No description"}</small>
                </span>
                <span>{coupon.discountType} · {coupon.discountValue}</span>
                <span>{coupon.applicablePlanCode || "all plans"} · {coupon.panelType || "all panels"}</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="button secondary" type="button" onClick={() => deactivate(coupon.code)}>Deactivate</button>
                </div>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>No coupons found</span>
                <span>Seed the table</span>
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
