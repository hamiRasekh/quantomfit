import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

export default async function Page() {
  let platform: { latestGyms?: Array<{ id: string; name: string; onboardingStatus: string }> } | null = null;
  try {
    platform = await api.get("/api/v1/platform");
  } catch {
    platform = null;
  }

  const latestGyms = platform?.latestGyms ?? [];

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">Audit</span>
        <h1>Admin actions and platform events.</h1>
        <p>Review recent tenant lifecycle changes and admin-visible activity.</p>
      </header>
      <div className="panel">
        <div className="section-head">
          <span>Recent admin-visible activity</span>
          <em>From platform summary</em>
        </div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>Gym</strong>
            <strong>Status</strong>
            <strong>Type</strong>
          </div>
          {latestGyms.length > 0 ? latestGyms.map((gym) => (
            <div className="qf-table__row" key={gym.id}>
              <span>{gym.name}</span>
              <span>{gym.onboardingStatus}</span>
              <span>Lifecycle event</span>
            </div>
          )) : (
            <div className="qf-table__row">
              <span>No audit entries yet</span>
              <span>--</span>
              <span>--</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
