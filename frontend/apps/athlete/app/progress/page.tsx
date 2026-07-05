import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

type AttendanceItem = {
  id: string;
  memberName: string;
  checkinAt: string;
  source: string;
};

type SessionItem = {
  id: string;
  title: string;
  dayLabel: string;
  status: string;
  completedAt?: string;
};

function uniqueDays(items: AttendanceItem[]) {
  return new Set(items.map((item) => new Date(item.checkinAt).toDateString())).size;
}

export default async function Page() {
  let attendance: AttendanceItem[] = [];
  let sessions: SessionItem[] = [];
  let dashboard: { attendance?: { today: number; week: number }; occupancy?: { current: number; capacity: number; ratio: number } } | null = null;
  try {
    const [attendancePayload, sessionsPayload, dashboardPayload] = await Promise.all([
      api.get<{ items: AttendanceItem[] }>("/api/v1/attendance?limit=30"),
      api.get<{ items: SessionItem[] }>("/api/v1/sessions?limit=12"),
      api.get<{ attendance?: { today: number; week: number }; occupancy?: { current: number; capacity: number; ratio: number } }>("/api/v1/dashboard"),
    ]);
    attendance = attendancePayload.items ?? [];
    sessions = sessionsPayload.items ?? [];
    dashboard = dashboardPayload;
  } catch {
    attendance = [];
    sessions = [];
    dashboard = null;
  }

  const completedSessions = sessions.filter((session) => session.status === "completed").length;
  const attendanceStreak = uniqueDays(attendance);
  const completionRate = sessions.length > 0 ? Math.round((completedSessions / sessions.length) * 100) : 0;

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Progress</span>
        <h1>Attendance streak, session completion, and recent training activity.</h1>
        <p>Progress is computed from your tenant-scoped check-ins and workout sessions, so the page always reflects live data.</p>
      </header>

      <div className="metrics">
        <article><strong>{attendanceStreak}</strong><span>active days logged</span></article>
        <article><strong>{completedSessions}</strong><span>completed sessions</span></article>
        <article><strong>{completionRate}%</strong><span>completion rate</span></article>
        <article><strong>{dashboard?.attendance?.week ?? attendance.length}</strong><span>weekly visits</span></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Recent sessions</span>
            <em>Workout history</em>
          </div>
          <ul className="timeline">
            {sessions.length > 0 ? sessions.map((session) => (
              <li key={session.id}>
                <strong>{session.dayLabel || "Session"}</strong>
                <span>{session.title} · {session.status}</span>
                {session.completedAt ? <small style={{ color: "var(--muted)" }}>Completed {new Date(session.completedAt).toLocaleDateString()}</small> : null}
              </li>
            )) : (
              <li>
                <strong>No workout sessions yet</strong>
                <span>Your trainer will assign sessions here once the program is active.</span>
              </li>
            )}
          </ul>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>Activity summary</span>
            <em>Derived from live data</em>
          </div>
          <div className="field-list">
            <div><strong>Today</strong><span>{dashboard?.attendance?.today ?? 0} check-ins recorded in your tenant.</span></div>
            <div><strong>Attendance streak</strong><span>{attendanceStreak} distinct training days in the current feed.</span></div>
            <div><strong>Completion</strong><span>{completionRate}% of assigned sessions are marked complete.</span></div>
          </div>
        </section>
      </div>
    </section>
  );
}
