"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

type Program = {
  id: string;
  name: string;
  status: string;
  trainerName?: string;
};

type Trainer = {
  id: string;
  fullName: string;
  specialty?: string;
  status: string;
};

export default function Page() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [form, setForm] = useState({ name: "", trainerId: "", status: "active" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [programPayload, trainerPayload] = await Promise.all([
          api.get<{ items: Program[] }>("/api/v1/programs?limit=24"),
          api.get<{ items: Trainer[] }>("/api/v1/trainers?limit=24"),
        ]);
        if (!mounted) {
          return;
        }
        setPrograms(programPayload.items ?? []);
        setTrainers(trainerPayload.items ?? []);
      } catch {
        if (mounted) {
          setPrograms([]);
          setTrainers([]);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function createProgram() {
    setMessage("");
    try {
      const created = await api.post<Program>("/api/v1/programs", form);
      setPrograms((current) => [created, ...current]);
      setForm({ name: "", trainerId: "", status: "active" });
      setMessage("برنامه ساخته شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ساخت برنامه ممکن نشد.");
    }
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">سازنده برنامه</span>
        <h1>الگوهای برنامه و طرح‌های تمرینی هفتگی.</h1>
        <p>برنامه‌های تمرینی را بساز و در محدوده همان باشگاه به مربی اختصاص بده.</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>ساخت برنامه</span><em>محدود به باشگاه</em></div>
          <div className="field-list">
            <div className="form-field"><label>نام</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-field"><label>مربی</label>
              <select value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}>
                <option value="">بدون انتساب</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>{trainer.fullName}{trainer.specialty ? ` · ${trainer.specialty}` : ""}</option>
                ))}
              </select>
            </div>
            <div className="form-field"><label>وضعیت</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">فعال</option>
                <option value="draft">پیش‌نویس</option>
                <option value="archived">بایگانی</option>
              </select>
            </div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createProgram} disabled={!form.name.trim()}>ذخیره برنامه</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>
        <section className="panel">
          <div className="section-head"><span>برنامه‌های فعلی</span><em>{programs.length} فعال</em></div>
          <div className="field-list">
            {programs.length > 0 ? programs.map((program) => (
              <Link key={program.id} href={`/programs/${program.id}`} style={{ display: "grid", gap: 6, textDecoration: "none", color: "inherit" }}>
                <strong>{program.name}</strong>
                <span>{program.status} · {program.trainerName ?? "بدون انتساب"}</span>
              </Link>
            )) : (
              <div><strong>برنامه‌ای ذخیره نشده</strong><span>از همین‌جا برنامه بساز و اختصاص بده.</span></div>
            )}
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>الگوها</span><em>آماده استفاده</em></div>
          <div className="field-list">
            <div><strong>پایه قدرت</strong><span>پیشرفت هفتگی و بازه‌های استراحت.</span></div>
            <div><strong>چرخه چربی‌سوزی</strong><span>کاردیو، کار متابولیک و ریکاوری.</span></div>
            <div><strong>بلوک حجم</strong><span>تفکیک عضلانی با ست و تکرار.</span></div>
          </div>
        </section>
        <section className="panel">
          <div className="section-head"><span>مربی‌های اختصاص‌داده‌شده</span><em>{trainers.length} بارگذاری‌شده</em></div>
          <div className="field-list">
            {trainers.length > 0 ? trainers.map((trainer) => (
              <div key={trainer.id}>
                <strong>{trainer.fullName}</strong>
                <span>{trainer.status}{trainer.specialty ? ` · ${trainer.specialty}` : ""}</span>
              </div>
            )) : (
              <div><strong>مربی‌ای پیدا نشد</strong><span>مربی‌های باشگاه از داده‌های مستاجر نمایش داده می‌شوند.</span></div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
