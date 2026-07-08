"use client";

import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Equipment = {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  status: string;
};

export default function Page() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", category: "", quantity: 1, status: "active" });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: Equipment[] }>("/api/v1/equipment?limit=24");
        if (!mounted) return;
        setItems(payload.items ?? []);
      } catch {
        if (mounted) setItems([]);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.name, item.category ?? "", item.status].join(" ").toLowerCase().includes(term)
    );
  }, [items, search]);

  async function createItem() {
    const created = await api.post<Equipment>("/api/v1/equipment", form);
    setItems((current) => [created, ...current]);
    setForm({ name: "", category: "", quantity: 1, status: "active" });
  }

  async function removeItem(id: string) {
    await api.delete(`/api/v1/equipment/${id}`);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">تجهیزات</span>
        <h1>موجودی و سرویس تجهیزات را بدون خروج از پنل مدیریت کن.</h1>
        <p>موجودی را بر اساس دسته، تعداد و وضعیت داخل مرز همین باشگاه نگه دار.</p>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>افزودن تجهیزات</span><em>محدوده باشگاه</em></div>
          <div className="field-list">
            <div className="form-field"><label>نام</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-field"><label>دسته</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div className="form-field"><label>تعداد</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createItem} disabled={!form.name.trim()}>ثبت تجهیزات</button>
          </div>
        </section>

        <section className="panel">
          <div className="section-head"><span>فهرست تجهیزات</span><em>{filtered.length} مورد</em></div>
          <div className="form-field" style={{ maxWidth: 420, marginBottom: 18 }}>
            <label>جست‌وجوی تجهیزات</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="نام، دسته یا وضعیت" />
          </div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>نام</strong>
              <strong>تعداد</strong>
              <strong>وضعیت</strong>
              <strong>عملیات</strong>
            </div>
            {filtered.length > 0 ? filtered.map((item) => (
              <div className="qf-table__row" key={item.id}>
                <span>
                  <strong>{item.name}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{item.category ?? "تجهیزات عمومی"}</small>
                </span>
                <span>{item.quantity}</span>
                <span>{item.status}</span>
                <button className="button secondary" type="button" onClick={() => removeItem(item.id)}>حذف</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>
                  <strong>تجهیزی پیدا نشد</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>وقتی دیتابیس seed شود، رکوردهای موجودی اینجا نمایش داده می‌شوند.</small>
                </span>
                <span>--</span>
                <span>--</span>
                <span>--</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
