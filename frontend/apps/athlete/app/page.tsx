import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

type Dashboard = {
  gymName?: string;
  attendance?: { today: number; week: number };
  occupancy?: { current: number; capacity: number; ratio: number };
  latestCheckins?: Array<{ id: string; memberName: string; checkinAt: string; source: string }>;
};

export default async function Page() {
  let dashboard: Dashboard | null = null;
  try {
    dashboard = await api.get("/api/v1/dashboard");
  } catch {
    dashboard = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Athlete App</span>
        <h1>{dashboard?.gymName ?? "Your gym"} in one mobile-ready workspace.</h1>
        <p>Workout, attendance, crowd status, notifications, and progress live in the athlete panel.</p>
      </header>

      <div className="metrics">
        <article><strong>{dashboard?.attendance?.today ?? 0}</strong><span>sessions today</span></article>
        <article><strong>{dashboard?.attendance?.week ?? 0}</strong><span>sessions this week</span></article>
        <article><strong>{dashboard?.occupancy?.current ?? 0}</strong><span>current occupancy</span></article>
        <article><strong>{dashboard?.occupancy?.ratio ? `${Math.round(dashboard.occupancy.ratio * 100)}%` : "0%"}</strong><span>gym utilization</span></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Today</span>
            <em>Personal plan</em>
          </div>
          <div className="field-list">
            <div><strong>Check-ins today</strong><span>{dashboard?.attendance?.today ?? 0}</span></div>
            <div><strong>Weekly streak</strong><span>{dashboard?.attendance?.week ?? 0} visits this week.</span></div>
            <div><strong>Gym crowd</strong><span>{dashboard?.occupancy?.current ?? 0} of {dashboard?.occupancy?.capacity ?? 0} inside.</span></div>
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>Quick actions</span>
            <em>Member flow</em>
          </div>
          <div className="detail-grid">
            <article><span className="status">Train</span><h3>Open workout</h3><p>Review today&apos;s program and mark completion.</p></article>
            <article><span className="status">Track</span><h3>Attendance</h3><p>See your check-ins and current streak.</p></article>
            <article><span className="status">Connect</span><h3>My gym</h3><p>View gym profile, coaches, and crowd status.</p></article>
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Recent check-ins</span><em>Tenant scoped</em></div>
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
          <div className="section-head"><span>Progress</span><em>Live summary</em></div>
          <div className="detail-grid">
            <article><span className="status">Status</span><h3>Connected</h3><p>Your account is linked to the gym tenant only.</p></article>
            <article><span className="status">Plan</span><h3>Current membership</h3><p>Membership details can be displayed here.</p></article>
            <article><span className="status">QR</span><h3>Entry code</h3><p>QR check-in can be surfaced from this panel.</p></article>
          </div>
        </section>
      </div>
    </section>
  );
}
