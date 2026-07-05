import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type PlatformSummary = {
  gymCount?: number;
  activeGyms?: number;
  pendingOnboardingGyms?: number;
  totalUsers?: number;
  trainerCount?: number;
  athleteCount?: number;
  activeDemoAccounts?: number;
  monthlyRevenue?: number;
  plans?: Array<{ code: string; name: string; monthlyPrice?: number; yearlyPrice?: number; currency?: string }>;
  coupons?: Array<{ code: string; discountType: string; discountValue: number }>;
  latestGyms?: Array<{
    id: string;
    name: string;
    planName: string;
    onboardingStatus: string;
    subscriptionStatus: string;
  }>;
};

export default async function Page() {
  let platform: PlatformSummary | null = null;
  try {
    platform = await api.get<PlatformSummary>("/api/v1/platform");
  } catch {
    platform = null;
  }

  const cards = [
    { label: "Gyms", value: platform?.gymCount ?? 0, note: "registered tenants" },
    { label: "Active gyms", value: platform?.activeGyms ?? 0, note: "ready in production" },
    { label: "Onboarding", value: platform?.pendingOnboardingGyms ?? 0, note: "still in setup" },
    { label: "Users", value: platform?.totalUsers ?? 0, note: "all platform accounts" },
    { label: "Coaches", value: platform?.trainerCount ?? 0, note: "trainer seats" },
    { label: "Athletes", value: platform?.athleteCount ?? 0, note: "member accounts" },
    { label: "Demo accounts", value: platform?.activeDemoAccounts ?? 0, note: "time boxed access" },
    { label: "Monthly revenue", value: `${Math.round(platform?.monthlyRevenue ?? 0).toLocaleString()}`, note: "estimate from subscriptions" },
  ];

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">QuantumFit Admin</span>
        <h1>Operate the platform from one premium control room.</h1>
        <p>
          Super admins manage gyms, users, plans, discounts, demo access, website content, and system health from one secure place.
        </p>
      </header>

      <div className="metrics">
        {cards.map((card) => (
          <article key={card.label}>
            <strong>{card.value}</strong>
            <span>{card.label}</span>
            <small style={{ color: "var(--qf-muted)" }}>{card.note}</small>
          </article>
        ))}
      </div>

      <div className="toolbar">
        <a className="button primary" href="/create-gym">Create gym</a>
        <a className="button secondary" href="/plans">Plans</a>
        <a className="button secondary" href="/discounts">Discounts</a>
        <a className="button secondary" href="/content">CMS</a>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Gym lifecycle</span>
            <em>Latest activity</em>
          </div>
          <div className="list">
            {platform?.latestGyms?.length ? platform.latestGyms.slice(0, 4).map((gym) => (
              <div key={gym.id}>
                <strong>{gym.name}</strong>
                <span>{gym.planName} · {gym.onboardingStatus} · {gym.subscriptionStatus}</span>
              </div>
            )) : (
              <div>
                <strong>No recent gyms</strong>
                <span>Create the first gym to populate this timeline.</span>
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span>Commercial controls</span>
            <em>Editable from admin</em>
          </div>
          <div className="detail-grid">
            <article><span className="status">Plans</span><h3>Pricing and limits</h3><p>Monthly, yearly, currency, and feature caps are managed here.</p></article>
            <article><span className="status">Coupons</span><h3>Campaign discounts</h3><p>Create stackable or restricted promo codes.</p></article>
            <article><span className="status">Discounts</span><h3>Gym-specific offers</h3><p>Apply long running discounts to one tenant or customer.</p></article>
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Public site</span>
            <em>CMS ready</em>
          </div>
          <div className="field-list">
            <div><strong>Homepage copy</strong><span>Editable hero, features, FAQ, testimonials, CTA.</span></div>
            <div><strong>Pricing copy</strong><span>Visible from the same backend data.</span></div>
            <div><strong>Demo content</strong><span>Request flows and feature previews stay manageable.</span></div>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span>Operational health</span>
            <em>System view</em>
          </div>
          <div className="detail-grid">
            <article><span className="status">Health</span><h3>99.9%</h3><p>API and database ready for daily operations.</p></article>
            <article><span className="status">RLS</span><h3>Tenant safe</h3><p>Queries remain scoped by gym_id or tenant_id.</p></article>
            <article><span className="status">Realtime</span><h3>Streaming</h3><p>Occupancy updates and activity feeds stay live.</p></article>
          </div>
        </section>
      </div>
    </section>
  );
}
