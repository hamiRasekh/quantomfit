import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page() {
  let onboarding: { status?: string; step?: string } | null = null;
  let dashboard: { gymName?: string } | null = null;
  try {
    const [onboardingPayload, dashboardPayload] = await Promise.all([
      api.get<{ status?: string; step?: string }>("/api/v1/onboarding/state"),
      api.get<{ gymName?: string }>("/api/v1/dashboard"),
    ]);
    onboarding = onboardingPayload;
    dashboard = dashboardPayload;
  } catch {
    onboarding = null;
    dashboard = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Settings</span>
        <h1>Panel settings and tenant identity.</h1>
      </header>
      <div className="detail-grid">
        <article><span className="status">Tenant</span><h3>{dashboard?.gymName ?? "Connected tenant"}</h3><p>resolved by host or panel header.</p></article>
        <article><span className="status">Onboarding</span><h3>{onboarding?.status ?? "created"}</h3><p>current onboarding state in PostgreSQL.</p></article>
        <article><span className="status">Step</span><h3>{onboarding?.step ?? "gym_name"}</h3><p>the next step in the wizard.</p></article>
      </div>
    </section>
  );
}
