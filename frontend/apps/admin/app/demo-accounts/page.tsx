"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type DemoAccess = {
  id: string;
  demoType: string;
  panelType: string;
  accountName: string;
  username: string;
  featureAccessLevel: string;
  readOnly: boolean;
  expiresAt: string;
  isActive: boolean;
  temporaryPassword?: string;
};

export default function Page() {
  const [items, setItems] = useState<DemoAccess[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    demoType: "gym",
    panelType: "gym",
    accountName: "حساب دمو باشگاه",
    username: "",
    password: "",
    featureAccessLevel: "full",
    readOnly: false,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    notes: "",
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: DemoAccess[] }>("/api/v1/admin/demo-accounts");
        if (mounted) {
          setItems(payload.items ?? []);
        }
      } catch {
        if (mounted) {
          setItems([]);
        }
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function createAccount() {
    setMessage("");
    try {
      const created = await api.post<DemoAccess>("/api/v1/admin/demo-accounts", form);
      setItems((current) => [created, ...current]);
      setMessage(created.temporaryPassword ? `رمز موقت: ${created.temporaryPassword}` : "حساب دمو ذخیره شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره حساب دمو ممکن نشد.");
    }
  }

  async function removeAccount(id: string) {
    await api.delete(`/api/v1/admin/demo-accounts/${id}`);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">دسترسی دمو</span>
        <h1>حساب‌های دمو ایزوله برای پنل باشگاه، مربی و ورزشکار.</h1>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>ساخت دمو</span><em>فقط ادمین</em></div>
          <div className="field-list">
            <div className="form-field">
              <label>نوع دمو</label>
              <select value={form.demoType} onChange={(e) => setForm({ ...form, demoType: e.target.value })}>
                <option value="gym">باشگاه</option>
                <option value="coach">مربی</option>
                <option value="athlete">ورزشکار</option>
              </select>
            </div>
            <div className="form-field">
              <label>نوع پنل</label>
              <select value={form.panelType} onChange={(e) => setForm({ ...form, panelType: e.target.value })}>
                <option value="gym">باشگاه</option>
                <option value="coach">مربی</option>
                <option value="app">ورزشکار</option>
              </select>
            </div>
            <div className="form-field">
              <label>نام حساب</label>
              <input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} />
            </div>
            <div className="form-field">
              <label>نام کاربری</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="form-field">
              <label>رمز عبور</label>
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="form-field">
              <label>انقضا</label>
              <input value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
            <div className="form-field">
              <label>سطح دسترسی</label>
              <input value={form.featureAccessLevel} onChange={(e) => setForm({ ...form, featureAccessLevel: e.target.value })} />
            </div>
            <label className="form-field" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" checked={form.readOnly} onChange={(e) => setForm({ ...form, readOnly: e.target.checked })} />
              <span>فقط خواندنی</span>
            </label>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createAccount}>ذخیره حساب دمو</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>

        <section className="panel">
          <div className="section-head"><span>فهرست دمو</span><em>{items.length} رکورد</em></div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>حساب</strong>
              <strong>نوع</strong>
              <strong>انقضا</strong>
              <strong>عملیات</strong>
            </div>
            {items.length > 0 ? items.map((item) => (
              <div className="qf-table__row" key={item.id}>
                <span>
                  <strong>{item.accountName}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{item.username}</small>
                </span>
                <span>{item.demoType} · {item.panelType}</span>
                <span>{new Date(item.expiresAt).toLocaleDateString()}</span>
                <button className="button secondary" type="button" onClick={() => removeAccount(item.id)}>حذف</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>هنوز حساب دمو ثبت نشده</span>
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
