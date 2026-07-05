import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page() {
  let dashboard: { attendance?: { today: number; week: number }; realtime?: { checkinsPerMinute: number } } | null = null;
  try {
    dashboard = await api.get("/api/v1/dashboard");
  } catch {
    dashboard = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Reports</span>
        <h1>Operational reports for the selected tenant.</h1>
        <p>Export-ready KPI snapshots for daily operations and weekly review.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">Today</span><h3>{dashboard?.attendance?.today ?? 0}</h3><p>check-ins today.</p></article>
        <article><span className="status">Week</span><h3>{dashboard?.attendance?.week ?? 0}</h3><p>check-ins this week.</p></article>
        <article><span className="status">Rate</span><h3>{dashboard?.realtime?.checkinsPerMinute ?? 0}</h3><p>check-ins per minute.</p></article>
      </div>
    </section>
  );
}
