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
        <span className="label">Reports</span>
        <h1>Student adherence and completion summary.</h1>
        <p>Reporting is computed from the live tenant data and updates as programs are completed.</p>
      </header>
      <div className="metrics">
        <article><strong>{completionRate}%</strong><span>program completion</span></article>
        <article><strong>{dashboard?.attendance?.week ?? 0}</strong><span>weekly visits</span></article>
        <article><strong>{dashboard?.members?.active ?? 0}</strong><span>active athletes</span></article>
        <article><strong>{missed}</strong><span>open sessions</span></article>
      </div>
      <div className="panel">
        <div className="section-head">
          <span>Recent sessions</span>
          <em>{sessions.length} loaded</em>
        </div>
        <ul className="timeline">
          {sessions.length > 0 ? sessions.map((session) => (
            <li key={session.id}>
              <strong>{session.dayLabel || "Session"}</strong>
              <span>{session.title} · {session.status}{session.completedAt ? ` · completed ${new Date(session.completedAt).toLocaleDateString()}` : ""}</span>
            </li>
          )) : (
            <li>
              <strong>No session history</strong>
              <span>Reports will populate once the coach creates programs and sessions.</span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
