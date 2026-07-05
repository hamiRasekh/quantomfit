import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type Platform = { gymCount?: number; activeGyms?: number; latestGyms?: Array<{ id: string; name: string }> };

export default async function Page() {
  let platform: Platform | null = null;
  try {
    platform = await api.get("/api/v1/platform");
  } catch {
    platform = null;
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">Analytics</span>
        <h1>Cross-tenant platform analytics.</h1>
        <p>Observe platform health, growth, and recent platform-side activity without exposing tenant data.</p>
      </header>
      <div className="metrics">
        <article><strong>{platform?.gymCount ?? 0}</strong><span>gyms total</span></article>
        <article><strong>{platform?.activeGyms ?? 0}</strong><span>active gyms</span></article>
        <article><strong>{platform?.latestGyms?.length ?? 0}</strong><span>recent gyms</span></article>
        <article><strong>Live</strong><span>safe by tenant boundary</span></article>
      </div>
      <div className="panel">
        <div className="section-head">
          <span>Platform overview</span>
          <em>Safe by design</em>
        </div>
        <div className="detail-grid">
          <article><span className="status">Tenants</span><h3>{platform?.gymCount ?? 0}</h3><p>Independent gym accounts managed through the admin panel.</p></article>
          <article><span className="status">Active</span><h3>{platform?.activeGyms ?? 0}</h3><p>Tenants currently active and ready for operation.</p></article>
          <article><span className="status">Recent</span><h3>{platform?.latestGyms?.length ?? 0}</h3><p>Latest gym lifecycle updates surfaced here.</p></article>
        </div>
      </div>
    </section>
  );
}
