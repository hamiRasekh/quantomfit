import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

export default async function Page() {
  let health: { status?: string; startedAt?: string; uptimeSec?: number } | null = null;
  let platform: { serviceName?: string; version?: string; env?: string } | null = null;
  try {
    health = await api.get("/api/v1/health");
    platform = await api.get("/api/v1/platform");
  } catch {
    health = null;
    platform = null;
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">System</span>
        <h1>Platform health and runtime details.</h1>
        <p>Monitor the runtime, service version, and uptime for the Go backend.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">Health</span><h3>{health?.status ?? "unknown"}</h3><p>API health endpoint.</p></article>
        <article><span className="status">Runtime</span><h3>{platform?.version ?? "dev"}</h3><p>{platform?.env ?? "development"}</p></article>
        <article><span className="status">Uptime</span><h3>{health?.uptimeSec ?? 0}s</h3><p>Go backend uptime.</p></article>
      </div>
    </section>
  );
}
