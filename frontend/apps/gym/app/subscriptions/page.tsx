import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page() {
  let subscription: Record<string, unknown> | null = null;
  try {
    subscription = await api.get("/api/v1/gym/subscription");
  } catch {
    subscription = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Subscriptions</span>
        <h1>Subscription state and billing cycle for this gym.</h1>
        <p>Manage the current plan and renewal state from the tenant perspective.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">Plan</span><h3>{String(subscription?.planName ?? subscription?.planCode ?? "starter")}</h3><p>Managed from the admin panel.</p></article>
        <article><span className="status">Status</span><h3>{String(subscription?.status ?? "inactive")}</h3><p>Renewal and coupon logic stored in PostgreSQL.</p></article>
        <article><span className="status">Billing</span><h3>{String(subscription?.billingCycle ?? "monthly")}</h3><p>Active cycle for the tenant.</p></article>
      </div>
    </section>
  );
}
