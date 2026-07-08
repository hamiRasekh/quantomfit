"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type MediaFile = {
  id: string;
  gymId?: string;
  kind: string;
  url: string;
  alt: string;
  createdAt: string;
};

export default function Page() {
  const [items, setItems] = useState<MediaFile[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    gymId: "",
    kind: "image",
    url: "",
    alt: "",
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: MediaFile[] }>("/api/v1/admin/media");
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

  async function createMedia() {
    setMessage("");
    try {
      const created = await api.post<MediaFile>("/api/v1/admin/media", form);
      setItems((current) => [created, ...current]);
      setMessage("رسانه ذخیره شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره رسانه ممکن نشد.");
    }
  }

  async function removeMedia(id: string) {
    await api.delete(`/api/v1/admin/media/${id}`);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">رسانه</span>
        <h1>تصاویر و دارایی‌های گالری باشگاه در یک لایه مدیریت می‌شوند.</h1>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>افزودن رسانه</span><em>آماده ذخیره‌سازی</em></div>
          <div className="field-list">
            <div className="form-field">
              <label>شناسه باشگاه</label>
              <input value={form.gymId} onChange={(e) => setForm({ ...form, gymId: e.target.value })} />
            </div>
            <div className="form-field">
              <label>نوع</label>
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                <option value="image">تصویر</option>
                <option value="logo">لوگو</option>
                <option value="gallery">گالری</option>
              </select>
            </div>
            <div className="form-field">
              <label>URL</label>
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <div className="form-field">
              <label>متن جایگزین</label>
              <input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} />
            </div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createMedia} disabled={!form.url.trim()}>ذخیره رسانه</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>

        <section className="panel">
          <div className="section-head"><span>کتابخانه</span><em>{items.length} فایل</em></div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>دارایی</strong>
              <strong>نوع</strong>
              <strong>باشگاه</strong>
              <strong>عملیات</strong>
            </div>
            {items.length > 0 ? items.map((item) => (
              <div className="qf-table__row" key={item.id}>
                <span>
                  <strong>{item.alt || item.url}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{item.url}</small>
                </span>
                <span>{item.kind}</span>
                <span>{item.gymId || "platform"}</span>
                <button className="button secondary" type="button" onClick={() => removeMedia(item.id)}>حذف</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>هنوز رسانه‌ای ثبت نشده</span>
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
