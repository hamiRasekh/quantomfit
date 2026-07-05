import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Dashboard = {
  gymName?: string;
  occupancy?: {
    current: number;
    capacity: number;
    ratio: number;
    heatmap?: Array<{ zone: string; value: number }>;
  };
  members?: { total: number; active: number; newThisMonth: number };
  trainers?: number;
  attendance?: { today: number; week: number };
  realtime?: { checkinsPerMinute: number; alerts: number };
  latestCheckins?: Array<{ id: string; memberName: string; checkinAt: string; source: string }>;
};

export default async function Page() {
  let dashboard: Dashboard | null = null;
  let onboarding: { status?: string; step?: string; payload?: Record<string, unknown> } | null = null;
  let members: Array<{ id: string; fullName: string; status: string }> = [];
  let trainers: Array<{ id: string; fullName: string; specialty?: string; status: string }> = [];
  let errorMessage: string | null = null;

  try {
    const [dashboardPayload, onboardingPayload, membersPayload, trainersPayload] = await Promise.all([
      api.get<Dashboard>("/api/v1/dashboard"),
      api.get<{ status?: string; step?: string; payload?: Record<string, unknown> }>("/api/v1/onboarding/state"),
      api.get<{ items: typeof members }>("/api/v1/members?limit=3"),
      api.get<{ items: typeof trainers }>("/api/v1/trainers?limit=3"),
    ]);
    dashboard = dashboardPayload;
    onboarding = onboardingPayload;
    members = membersPayload.items ?? [];
    trainers = trainersPayload.items ?? [];
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "API is unavailable";
  }

  const occupancy = dashboard?.occupancy;
  const memberStats = dashboard?.members;
  const onboardingActive = onboarding?.status === "active";

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Gym Owner Panel</span>
        <h1>{dashboard?.gymName ?? "Operate your gym with live occupancy and strict tenant isolation."}</h1>
        <p>First login guides the owner through a wizard that activates the gym after profile completion.</p>
        {errorMessage ? <p>{errorMessage}</p> : null}
      </header>

      <div className="metrics">
        <article><strong>{occupancy?.current ?? 0}</strong><span>current occupancy</span></article>
        <article><strong>{memberStats?.active ?? 0}</strong><span>active members</span></article>
        <article><strong>{dashboard?.trainers ?? 0}</strong><span>trainers</span></article>
        <article><strong>{occupancy && occupancy.capacity > 0 ? Math.round(occupancy.ratio * 100) : 0}%</strong><span>occupancy ratio</span></article>
      </div>

      <div className="toolbar">
        <a className="button primary" href="/live">Open live view</a>
        <a className="button secondary" href="/members">Manage members</a>
        <a className="button secondary" href="/onboarding">Continue onboarding</a>
      </div>

      {!onboardingActive ? (
        <section className="panel" style={{ marginBottom: 24 }}>
          <div className="section-head">
            <span>Onboarding Required</span>
            <em>{onboarding?.status ?? "pending"} · {onboarding?.step ?? "gym_name"}</em>
          </div>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
            Complete the setup wizard to activate the gym panel and unlock live operations, attendance, and analytics.
          </p>
          <ol className="wizard">
            <li>Gym name</li>
            <li>Gym type</li>
            <li>Location</li>
            <li>Size</li>
            <li>Brand assets</li>
            <li>Contact info</li>
            <li>Working hours</li>
            <li>Equipment list</li>
            <li>Trainer count</li>
            <li>Review and activate</li>
          </ol>
        </section>
      ) : null}

      <div className="content">
        <section className="panel panel-compact">
          <div className="section-head">
            <span>Live Operations</span>
            <em>Updated just now</em>
          </div>
          <ul className="timeline">
            {(dashboard?.latestCheckins ?? []).slice(0, 3).map((item) => (
              <li key={item.id}>
                <strong>{new Date(item.checkinAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
                <span>{item.memberName} checked in via {item.source}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>Members</span>
            <em>Tenant scoped</em>
          </div>
          <div className="table">
            <div><strong>Name</strong><strong>Status</strong><strong>Plan</strong></div>
            {members.length > 0 ? members.map((member) => (
              <div key={member.id}><span>{member.fullName}</span><span>{member.status}</span><span>Member</span></div>
            )) : (
              <div><span>{dashboard?.members ? "Members loaded" : "No data yet"}</span><span>{dashboard?.members?.active ?? 0}</span><span>{dashboard?.members?.newThisMonth ?? 0}</span></div>
            )}
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel panel-compact">
          <div className="section-head">
            <span>Occupancy Heatmap</span>
            <em>Cardio / weights / studio</em>
          </div>
          <div className="heatmap">
            {(occupancy?.heatmap ?? []).map((zone) => (
              <div key={zone.zone}><span>{zone.zone}</span><strong>{Math.round(zone.value * 100)}%</strong></div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>Live Queue</span>
            <em>{dashboard?.realtime?.checkinsPerMinute ?? 0} check-ins/min</em>
          </div>
          <div className="field-list">
            <div><strong>Gate entry</strong><span>Entry stream is tenant-scoped and live.</span></div>
            <div><strong>Class check-in</strong><span>{dashboard?.attendance?.today ?? 0} check-ins today.</span></div>
            <div><strong>Retention SMS</strong><span>{dashboard?.realtime?.alerts ?? 0} alerts in the queue.</span></div>
            {trainers.length > 0 ? (
              trainers.slice(0, 2).map((trainer) => (
                <div key={trainer.id}><strong>{trainer.fullName}</strong><span>{trainer.specialty ?? trainer.status}</span></div>
              ))
            ) : null}
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Today Snapshot</span>
            <em>Operational</em>
          </div>
          <div className="detail-grid">
            <article><span className="status">Healthy</span><h3>Access control</h3><p>All panel routes are tenant-aware.</p></article>
            <article><span className="status">Stable</span><h3>Billing</h3><p>Plan renewal and coupon logic ready.</p></article>
            <article><span className="status">Live</span><h3>Occupancy</h3><p>Real-time counters ready for streaming.</p></article>
          </div>
        </section>
      </div>
    </section>
  );
}
