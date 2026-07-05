import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page() {
  let analytics: { series?: Array<{ label: string; value: number }>; kpis?: Record<string, number> } | null = null;
  try {
    analytics = await api.get("/api/v1/analytics/dashboard");
  } catch {
    analytics = null;
  }

  const series = analytics?.series ?? [];
  const kpis = analytics?.kpis ?? {};

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Analytics</span>
        <h1>Operational analytics and retention signals.</h1>
        <p>Track attendance, retention, revenue direction, and live occupancy signals from a tenant-scoped dashboard.</p>
      </header>

      <div className="panel">
        <div className="section-head">
          <span>Series</span>
          <em>7-day trend</em>
        </div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>Label</strong>
            <strong>Value</strong>
            <strong>Signal</strong>
          </div>
          {series.length > 0 ? series.map((point) => (
            <div className="qf-table__row" key={point.label}>
              <span><strong>{point.label}</strong></span>
              <span>{point.value}</span>
              <span>Tracked</span>
            </div>
          )) : (
            <div className="qf-table__row">
              <span>
                <strong>No series data</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>Analytics will appear once attendance events are flowing.</small>
              </span>
              <span>--</span>
              <span>--</span>
            </div>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <article><span className="status">Revenue growth</span><h3>{kpis.revenueGrowth ?? 0}%</h3><p>Managed by the platform analytics layer.</p></article>
        <article><span className="status">Retention</span><h3>{kpis.memberRetention ?? 0}%</h3><p>Derived from gym activity and attendance.</p></article>
        <article><span className="status">Peak occupancy</span><h3>{kpis.occupancyPeak ? `${Math.round(kpis.occupancyPeak * 100)}%` : "0%"}</h3><p>From live occupancy snapshots.</p></article>
      </div>
    </section>
  );
}
