"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  trainerId?: string;
  trainerName?: string;
};

type Trainer = {
  id: string;
  fullName: string;
  specialty?: string;
  status: string;
};

type Session = {
  id: string;
  title: string;
  dayLabel: string;
  status: string;
  notes?: string;
  completedAt?: string;
};

export default function Page() {
  const params = useParams<{ programId?: string }>();
  const programId = params.programId ?? "";
  const [program, setProgram] = useState<Program | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", trainerId: "", status: "active" });
  const [sessionForm, setSessionForm] = useState({ title: "", dayLabel: "", notes: "", status: "pending" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [programPayload, trainerPayload, sessionsPayload] = await Promise.all([
          api.get<Program>(`/api/v1/programs/${programId}`),
          api.get<{ items: Trainer[] }>("/api/v1/trainers?limit=24"),
          api.get<{ items: Session[] }>(`/api/v1/programs/${programId}/sessions?limit=24`),
        ]);
        if (!mounted) {
          return;
        }
        const loadedSessions = sessionsPayload.items ?? [];
        setProgram(programPayload);
        setForm({
          name: programPayload.name ?? "",
          trainerId: programPayload.trainerId ?? "",
          status: programPayload.status ?? "active",
        });
        setTrainers(trainerPayload.items ?? []);
        setSessions(loadedSessions);
        setSessionNotes(Object.fromEntries(loadedSessions.map((session) => [session.id, session.notes ?? ""])));
      } catch {
        if (mounted) {
          setProgram(null);
          setTrainers([]);
          setSessions([]);
          setSessionNotes({});
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [programId]);

  async function save() {
    setMessage("");
    try {
      const updated = await api.patch<Program>(`/api/v1/programs/${programId}`, form);
      setProgram(updated);
      setMessage("برنامه به‌روزرسانی شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "به‌روزرسانی برنامه ممکن نشد.");
    }
  }

  async function createSession() {
    setMessage("");
    try {
      const created = await api.post<Session>(`/api/v1/programs/${programId}/sessions`, sessionForm);
      setSessions((current) => [created, ...current]);
      setSessionNotes((current) => ({ ...current, [created.id]: created.notes ?? "" }));
      setSessionForm({ title: "", dayLabel: "", notes: "", status: "pending" });
      setMessage("سشن ساخته شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ساخت سشن ممکن نشد.");
    }
  }

  async function saveSessionNotes(sessionId: string) {
    setMessage("");
    try {
      const updated = await api.patch<Session>(`/api/v1/sessions/${sessionId}`, {
        notes: sessionNotes[sessionId] ?? "",
      });
      setSessions((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSessionNotes((current) => ({ ...current, [updated.id]: updated.notes ?? "" }));
      setMessage("یادداشت سشن ذخیره شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره یادداشت سشن ممکن نشد.");
    }
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">جزئیات برنامه</span>
        <h1>{program?.name ?? "برنامه تمرینی"}</h1>
        <p>متادیتا، سشن‌ها و انتساب مربی را ویرایش کن.</p>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>ویرایش برنامه</span><em>محدود به باشگاه</em></div>
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
            <button className="button primary" type="button" onClick={save}>ذخیره تغییرات</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>

        <section className="panel">
          <div className="section-head"><span>ساخت سشن</span><em>جریان برنامه</em></div>
          <div className="field-list">
            <div className="form-field"><label>عنوان</label><input value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} /></div>
            <div className="form-field"><label>برچسب روز</label><input value={sessionForm.dayLabel} onChange={(e) => setSessionForm({ ...sessionForm, dayLabel: e.target.value })} /></div>
            <div className="form-field"><label>یادداشت</label><input value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createSession} disabled={!sessionForm.title.trim()}>افزودن سشن</button>
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>خلاصه</span><em>{program?.status ?? "فعال"}</em></div>
          <div className="detail-grid">
            <article><span className="status">مربی</span><h3>{program?.trainerName ?? "بدون انتساب"}</h3><p>از جدول برنامه‌ها لینک می‌شود.</p></article>
            <article><span className="status">نوع</span><h3>طرح هفتگی</h3><p>توسط ورزشکار و مربی استفاده می‌شود.</p></article>
            <article><span className="status">جریان</span><h3>انتساب به عضو</h3><p>از جزئیات شاگرد برای اتصال این برنامه استفاده کن.</p></article>
          </div>
        </section>

        <section className="panel">
          <div className="section-head"><span>سشن‌ها</span><em>{sessions.length} ورودی</em></div>
          <ul className="timeline">
            {sessions.length > 0 ? sessions.map((session) => (
              <li key={session.id}>
                <strong>{session.dayLabel || "سشن"}</strong>
                <span>{session.title} · {session.status}{session.completedAt ? ` · تکمیل‌شده ${new Date(session.completedAt).toLocaleDateString()}` : ""}</span>
                <textarea
                  value={sessionNotes[session.id] ?? session.notes ?? ""}
                  onChange={(event) => setSessionNotes((current) => ({ ...current, [session.id]: event.target.value }))}
                  placeholder="یادداشت مربی یا بازخورد تمرینی را اضافه کن"
                  rows={3}
                  style={{
                    marginTop: 12,
                    width: "100%",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,16,28,0.7)",
                    color: "var(--text)",
                    padding: "0.9rem 1rem",
                    resize: "vertical",
                  }}
                />
                <div className="actions" style={{ marginTop: 10 }}>
                  <button className="button secondary" type="button" onClick={() => saveSessionNotes(session.id)}>
                    ذخیره یادداشت
                  </button>
                </div>
              </li>
            )) : (
              <li><strong>هنوز سشنی وجود ندارد</strong><span>اولین سشن را از فرم بالا بساز.</span></li>
            )}
          </ul>
        </section>
      </div>
    </section>
  );
}
