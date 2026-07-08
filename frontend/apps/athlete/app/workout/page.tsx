"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

type Program = {
  id: string;
  name: string;
  status: string;
  trainerName?: string;
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
  const [program, setProgram] = useState<Program | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [programPayload, sessionsPayload] = await Promise.all([
          api.get<{ program?: Program | null }>("/api/v1/programs/current"),
          api.get<{ items: Session[] }>("/api/v1/sessions?limit=8"),
        ]);
        if (!mounted) {
          return;
        }
        setProgram(programPayload.program ?? null);
        setSessions(sessionsPayload.items ?? []);
      } catch {
        if (mounted) {
          setProgram(null);
          setSessions([]);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function completeSession(sessionId: string) {
    setMessage("");
    try {
      const completed = await api.post<Session>(`/api/v1/sessions/${sessionId}/complete`, {});
      setSessions((current) => current.map((item) => (item.id === completed.id ? completed : item)));
      setMessage("سشن تکمیل شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تکمیل سشن ممکن نشد.");
    }
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">تمرین</span>
        <h1>برنامه تمرینی فعلی تو.</h1>
        <p>تکمیل سشن، یادداشت مربی و ساختار هفتگی از مستاجر فعال بارگذاری می‌شود.</p>
      </header>

      <div className="detail-grid">
        <article>
          <span className="status">برنامه</span>
          <h3>{program?.name ?? "برنامه فعالی وجود ندارد"}</h3>
          <p>{program?.status ?? "وقتی برنامه اختصاص داده شود اینجا نمایش داده می‌شود."}</p>
        </article>
        <article>
          <span className="status">مربی</span>
          <h3>{program?.trainerName ?? "مربی اختصاص‌داده‌شده"}</h3>
          <p>از مستاجر باشگاه لینک می‌شود.</p>
        </article>
        <article>
          <span className="status">وضعیت</span>
          <h3>آماده</h3>
          <p>هم‌زمان با تمرین، سشن‌ها را تکمیل کن.</p>
        </article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>برنامه هفتگی</span>
            <em>نمای برنامه</em>
          </div>
          <div className="field-list">
            <div><strong>روز ۱</strong><span>تمرکز پوش با حجم کنترل‌شده.</span></div>
            <div><strong>روز ۲</strong><span>تمرکز پول با پشت و بازو.</span></div>
            <div><strong>روز ۳</strong><span>تمرکز پا با ریکاوری داخلی.</span></div>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span>تکمیل</span>
            <em>جریان عضو</em>
          </div>
          <div className="detail-grid">
            <article>
              <span className="status">انجام‌شده</span>
              <h3>{sessions.filter((session) => session.status === "completed").length} تکمیل‌شده</h3>
              <p>سشن‌ها را از داخل اپ کامل کن.</p>
            </article>
            <article>
              <span className="status">تاریخچه</span>
              <h3>{sessions.length} sessions</h3>
              <p>آخرین فعالیت تمرینی همیشه قابل مشاهده بماند.</p>
            </article>
            <article>
              <span className="status">مربی</span>
              <h3>بازخورد</h3>
              <p>یادداشت‌های مربی زیر هر سشن نمایش داده می‌شود.</p>
            </article>
          </div>
        </section>
      </div>

      <div className="panel">
        <div className="section-head">
          <span>فعالیت اخیر</span>
          <em>تاریخچه مستاجر</em>
        </div>
        <ul className="timeline">
          {sessions.length > 0 ? sessions.map((item) => (
            <li key={item.id}>
              <strong>{item.dayLabel || "سشن"}</strong>
              <span>{item.title} · {item.status}{item.completedAt ? ` · تکمیل‌شده ${new Date(item.completedAt).toLocaleDateString()}` : ""}</span>
              {item.notes ? <p style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>{item.notes}</p> : null}
              {item.status !== "completed" ? (
                <button className="button secondary" type="button" onClick={() => completeSession(item.id)} style={{ width: "fit-content", marginTop: 8 }}>
                  تکمیل شد
                </button>
              ) : null}
            </li>
          )) : (
            <li>
              <strong>فعلاً فعالیتی ثبت نشده</strong>
              <span>بعد از اولین انتساب، سشن‌های تمرین اینجا ظاهر می‌شوند.</span>
            </li>
          )}
        </ul>
        {message ? <p>{message}</p> : null}
      </div>
    </section>
  );
}
