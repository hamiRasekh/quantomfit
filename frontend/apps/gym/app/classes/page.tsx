"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type GymClass = {
  id: string;
  trainerId?: string;
  title: string;
  capacity: number;
  schedule: string;
  status: string;
};

export default function Page() {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [form, setForm] = useState({ trainerId: "", title: "", capacity: 20, schedule: "", status: "active" });

  useEffect(() => {
    let mounted = true;
    api.get<{ items: GymClass[] }>("/api/v1/classes?limit=24")
      .then((payload) => {
        if (mounted) {
          setClasses(payload.items ?? []);
        }
      })
      .catch(() => {
        if (mounted) {
          setClasses([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function createClass() {
    const created = await api.post<GymClass>("/api/v1/classes", form);
    setClasses((current) => [created, ...current]);
    setForm({ trainerId: "", title: "", capacity: 20, schedule: "", status: "active" });
  }

  async function removeClass(id: string) {
    await api.delete(`/api/v1/classes/${id}`);
    setClasses((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">کلاس‌ها</span>
        <h1>زمان‌بندی و ظرفیت کلاس‌ها.</h1>
        <p>عملیات کلاس را با یک نگاه به برنامه و کارت‌های وضعیت شفاف نگه دار.</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>ثبت کلاس</span>
            <em>محدوده باشگاه</em>
          </div>
          <div className="field-list">
            <div className="form-field"><label>عنوان</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="form-field"><label>شناسه مربی</label><input value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })} /></div>
            <div className="form-field"><label>ظرفیت</label><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
            <div className="form-field"><label>زمان‌بندی</label><input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="دوشنبه/چهارشنبه/جمعه ۱۸:۰۰" /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createClass} disabled={!form.title.trim()}>ثبت کلاس</button>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span>برنامه</span>
            <em>{classes.length} کلاس</em>
          </div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>کلاس</strong>
              <strong>زمان</strong>
              <strong>ظرفیت</strong>
              <strong>عملیات</strong>
            </div>
            {classes.length > 0 ? classes.map((item) => (
              <div className="qf-table__row" key={item.id}>
                <span>
                  <strong>{item.title}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{item.trainerId || "مربی تعیین نشده"}</small>
                </span>
                <span>{item.schedule}</span>
                <span>{item.capacity} نفر</span>
                <button className="button secondary" type="button" onClick={() => removeClass(item.id)}>حذف</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span><strong>هنوز کلاسی ثبت نشده</strong><small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>اولین کلاس را از فرم بالا اضافه کن.</small></span>
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
