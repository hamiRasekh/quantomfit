import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type Gym = {
  id: string;
  name: string;
  slug: string;
  planName: string;
  onboardingStatus: string;
  subscriptionStatus: string;
};

export default async function Page() {
  let gyms: Gym[] = [];
  try {
    const payload = await api.get<{ items: Gym[] }>("/api/v1/admin/gyms");
    gyms = payload.items ?? [];
  } catch {
    gyms = [];
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">Gyms</span>
        <h1>All gyms, all tenants, one secure admin view.</h1>
        <p>Use this page to inspect lifecycle status, plan assignment, and onboarding readiness.</p>
      </header>

      <div className="panel">
        <div className="section-head">
          <span>Gym list</span>
          <em>{gyms.length} gyms</em>
        </div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>Name</strong>
            <strong>Plan</strong>
            <strong>Status</strong>
          </div>
          {gyms.length > 0 ? gyms.map((gym) => (
            <div className="qf-table__row" key={gym.id}>
              <span>
                <strong>{gym.name}</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{gym.slug}</small>
              </span>
              <span>{gym.planName}</span>
              <span>{gym.onboardingStatus} · {gym.subscriptionStatus}</span>
            </div>
          )) : (
            <div className="qf-table__row">
              <span>
                <strong>No gyms found</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>Use Create Gym to provision the first tenant.</small>
              </span>
              <span>--</span>
              <span>--</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
