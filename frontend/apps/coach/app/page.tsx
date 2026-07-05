import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

type Dashboard = {
  gymName?: string;
  members?: { total: number; active: number; newThisMonth: number };
  trainers?: number;
  attendance?: { today: number; week: number };
  occupancy?: { current: number; capacity: number; ratio: number };
  latestCheckins?: Array<{ id: string; memberName: string; checkinAt: string; source: string }>;
};

export default async function Page() {
  let dashboard: Dashboard | null = null;
  let students: Array<{ id: string; fullName: string; status: string }> = [];

  try {
    const [dashboardPayload, studentsPayload] = await Promise.all([
      api.get<Dashboard>("/api/v1/dashboard"),
      api.get<{ items: typeof students }>("/api/v1/members?limit=6"),
    ]);
    dashboard = dashboardPayload;
    students = studentsPayload.items ?? [];
  } catch {
    dashboard = null;
    students = [];
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Trainer Panel</span>
        <h1>Coach workspace for members, programs, and sessions.</h1>
        <p>Track assigned athletes, progress signals, and live attendance from the gym tenant only.</p>
      </header>

      <div className="metrics">
        <article><strong>{dashboard?.members?.active ?? 0}</strong><span>active athletes</span></article>
        <article><strong>{dashboard?.attendance?.today ?? 0}</strong><span>check-ins today</span></article>
        <article><strong>{dashboard?.trainers ?? 0}</strong><span>trainer seats</span></article>
        <article><strong>{dashboard?.occupancy?.ratio ? `${Math.round(dashboard.occupancy.ratio * 100)}%` : "0%"}</strong><span>floor utilization</span></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Today</span>
            <em>{dashboard?.gymName ?? "Connected gym"}</em>
          </div>
          <div className="field-list">
            <div><strong>Sessions</strong><span>{dashboard?.attendance?.today ?? 0} workouts tracked today.</span></div>
            <div><strong>Live occupancy</strong><span>{dashboard?.occupancy?.current ?? 0} inside of {dashboard?.occupancy?.capacity ?? 0} capacity.</span></div>
            <div><strong>Growth</strong><span>{dashboard?.members?.newThisMonth ?? 0} new members this month.</span></div>
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>Students</span>
            <em>Assigned to you</em>
          </div>
          <div className="list">
            {students.length > 0 ? students.slice(0, 4).map((student) => (
              <div key={student.id}><strong>{student.fullName}</strong><span>{student.status}</span></div>
            )) : (
              <div><strong>No students yet</strong><span>Seeded gym members will appear here.</span></div>
            )}
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Recent activity</span><em>Live feed</em></div>
          <ul className="timeline">
            {(dashboard?.latestCheckins ?? []).slice(0, 4).map((item) => (
              <li key={item.id}>
                <strong>{new Date(item.checkinAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
                <span>{item.memberName} · {item.source}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <div className="section-head"><span>Next actions</span><em>Coach flow</em></div>
          <div className="detail-grid">
            <article><span className="status">Build</span><h3>Workout plan</h3><p>Create and assign a new program from Programs.</p></article>
            <article><span className="status">Review</span><h3>Student progress</h3><p>Open the student list for detail and adherence.</p></article>
            <article><span className="status">Monitor</span><h3>Attendance</h3><p>Use attendance history to adjust coaching.</p></article>
          </div>
        </section>
      </div>
    </section>
  );
}
