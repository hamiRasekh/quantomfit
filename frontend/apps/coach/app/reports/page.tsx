import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

type Session = {
  id: string;
  title: string;
  dayLabel: string;
  status: string;
  completedAt?: string;
};

export default async function Page() {
  let sessions: Session[] = [];
  let dashboard: { attendance?: { today: number; week: number }; members?: { active: number; total: number } } | null = null;
  try {
    const [sessionsPayload, dashboardPayload] = await Promise.all([
      api.get<{ items: Session[] }>("/api/v1/sessions?limit=24"),
      api.get<{ attendance?: { today: number; week: number }; members?: { active: number; total: number } }>("/api/v1/dashboard"),
    ]);
    sessions = sessionsPayload.items ?? [];
    dashboard = dashboardPayload;
  } catch {
    sessions = [];
    dashboard = null;
  }

  const completed = sessions.filter((session) => session.status === "completed").length;
  const completionRate = sessions.length > 0 ? Math.round((completed / sessions.length) * 100) : 0;
  const missed = sessions.filter((session) => session.status !== "completed").length;

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">گزارش‌ها</span>
        <h1>خلاصه پایبندی شاگرد و تکمیل برنامه.</h1>
        <p>گزارش‌ها از داده زنده مستاجر محاسبه می‌شوند و با تکمیل برنامه به‌روز می‌مانند.</p>
      </header>
      <div className="metrics">
        <article><strong>{completionRate}%</strong><span>تکمیل برنامه</span></article>
        <article><strong>{dashboard?.attendance?.week ?? 0}</strong><span>بازدید هفتگی</span></article>
        <article><strong>{dashboard?.members?.active ?? 0}</strong><span>ورزشکار فعال</span></article>
        <article><strong>{missed}</strong><span>سشن باز</span></article>
      </div>
      <div className="panel">
        <div className="section-head">
          <span>سشن‌های اخیر</span>
          <em>{sessions.length} بارگذاری‌شده</em>
        </div>
        <ul className="timeline">
          {sessions.length > 0 ? sessions.map((session) => (
            <li key={session.id}>
              <strong>{session.dayLabel || "سشن"}</strong>
              <span>{session.title} · {session.status}{session.completedAt ? ` · تکمیل‌شده ${new Date(session.completedAt).toLocaleDateString()}` : ""}</span>
            </li>
          )) : (
            <li>
              <strong>هنوز تاریخچه‌ای نداریم</strong>
              <span>وقتی مربی برنامه و سشن بسازد، گزارش‌ها پر می‌شوند.</span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
