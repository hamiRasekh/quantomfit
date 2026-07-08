"use client";

import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Trainer = {
  id: string;
  fullName: string;
  specialty?: string;
  status: string;
};

export default function Page() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ fullName: "", specialty: "", status: "active" });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: Trainer[] }>("/api/v1/trainers?limit=24");
        if (!mounted) return;
        setTrainers(payload.items ?? []);
      } catch {
        if (mounted) setTrainers([]);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return trainers;
    return trainers.filter((trainer) =>
      [trainer.fullName, trainer.specialty ?? "", trainer.status].join(" ").toLowerCase().includes(term)
    );
  }, [trainers, search]);

  async function createTrainer() {
    const created = await api.post<Trainer>("/api/v1/trainers", form);
    setTrainers((current) => [created, ...current]);
    setForm({ fullName: "", specialty: "", status: "active" });
  }

  async function removeTrainer(id: string) {
    await api.delete(`/api/v1/trainers/${id}`);
    setTrainers((current) => current.filter((trainer) => trainer.id !== id));
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">مربی‌ها</span>
        <h1>مربی‌ها و تخصص‌هایشان را داخل یک باشگاه هماهنگ کن.</h1>
        <p>تیم مربی، نمایش‌پذیری و انتساب اعضا را از یک نمای امن مدیریت کن.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">فعال</span><h3>فهرست مربی‌ها</h3><p>مرتب‌شده بر اساس تخصص و وضعیت.</p></article>
        <article><span className="status">برنامه‌ها</span><h3>کارهای انتسابی</h3><p>برنامه‌ها و سشن‌های مرتبط.</p></article>
        <article><span className="status">عملیات</span><h3>مدیریت پرسنل</h3><p>ایجاد، ویرایش و حذف مربی‌ها همین‌جا.</p></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>افزودن مربی</span>
            <em>محدوده باشگاه</em>
          </div>
          <div className="field-list">
            <div className="form-field"><label>نام و نام خانوادگی</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div className="form-field"><label>تخصص</label><input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createTrainer} disabled={!form.fullName.trim()}>ثبت مربی</button>
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>فهرست مربی‌ها</span>
            <em>{filtered.length} مربی</em>
          </div>
          <div className="form-field" style={{ maxWidth: 420, marginBottom: 18 }}>
            <label>جست‌وجوی مربی‌ها</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="نام، تخصص یا وضعیت" />
          </div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>نام</strong>
              <strong>تخصص</strong>
              <strong>وضعیت</strong>
              <strong>عملیات</strong>
            </div>
            {filtered.length > 0 ? filtered.map((trainer) => (
              <div className="qf-table__row" key={trainer.id}>
                <span>
                  <strong>{trainer.fullName}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>مربی محدوده همین باشگاه</small>
                </span>
                <span>{trainer.specialty ?? "مربی عمومی"}</span>
                <span>{trainer.status}</span>
                <button className="button secondary" type="button" onClick={() => removeTrainer(trainer.id)}>حذف</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>
                  <strong>مربی‌ای پیدا نشد</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>بعد از بالا آمدن دیتابیس، داده‌های seed اینجا ظاهر می‌شوند.</small>
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
