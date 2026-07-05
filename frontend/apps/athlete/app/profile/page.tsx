import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

export default async function Page() {
  let me: { userId?: string; role?: string; panel?: string; tenant?: { name?: string; slug?: string } } | null = null;
  let dashboard: { attendance?: { today: number; week: number }; occupancy?: { current: number; capacity: number } } | null = null;

  try {
    const [mePayload, dashboardPayload] = await Promise.all([
      api.get<{ userId?: string; role?: string; panel?: string; tenant?: { name?: string; slug?: string } }>("/api/v1/auth/me"),
      api.get<{ attendance?: { today: number; week: number }; occupancy?: { current: number; capacity: number } }>("/api/v1/dashboard"),
    ]);
    me = mePayload;
    dashboard = dashboardPayload;
  } catch {
    me = null;
    dashboard = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Profile</span>
        <h1>Personal settings and account access.</h1>
      </header>
      <div className="detail-grid">
        <article><span className="status">Identity</span><h3>{me?.role ?? "athlete"}</h3><p>{me?.userId ?? "member account"}</p></article>
        <article><span className="status">Tenant</span><h3>{me?.tenant?.name ?? "Connected gym"}</h3><p>{me?.tenant?.slug ?? "app"} tenant scope</p></article>
        <article><span className="status">Activity</span><h3>{dashboard?.attendance?.week ?? 0} visits</h3><p>{dashboard?.occupancy?.current ?? 0} / {dashboard?.occupancy?.capacity ?? 0} inside.</p></article>
      </div>
    </section>
  );
}
