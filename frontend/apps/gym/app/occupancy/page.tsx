import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page() {
  let occupancy: {
    current?: number;
    capacity?: number;
    ratio?: number;
    heatmap?: Array<{ zone: string; value: number }>;
  } | null = null;

  try {
    occupancy = await api.get("/api/v1/occupancy/current");
  } catch {
    occupancy = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Occupancy</span>
        <h1>Live occupancy tracked by gate and studio zone.</h1>
      </header>
      <div className="detail-grid">
        <article><span className="status">Current</span><h3>{occupancy?.current ?? 0}</h3><p>active entries inside the gym.</p></article>
        <article><span className="status">Capacity</span><h3>{occupancy?.capacity ?? 0}</h3><p>hard limit from the onboarding profile.</p></article>
        <article><span className="status">Ratio</span><h3>{occupancy?.ratio ? `${Math.round(occupancy.ratio * 100)}%` : "0%"}</h3><p>real-time utilization.</p></article>
      </div>
    </section>
  );
}
