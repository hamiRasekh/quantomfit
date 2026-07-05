import { createApiClient } from "@quantomfit/api-client";

type WebsiteContent = {
  section: string;
  title: string;
  subtitle: string;
  body: string;
  cta: string;
  features?: string[];
  faq?: Array<{ q?: string; a?: string; question?: string; answer?: string }>;
  testimonials?: Array<{ name?: string; quote?: string }>;
  images?: string[];
};

type PlatformSummary = {
  gymCount?: number;
  activeGyms?: number;
  plans?: Array<{
    code: string;
    name: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
    currency?: string;
    limits?: Record<string, unknown>;
  }>;
  latestGyms?: Array<{
    id: string;
    name: string;
    planName: string;
    onboardingStatus: string;
  }>;
};

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "marketing",
  },
});

function sectionMap(items: WebsiteContent[]) {
  return items.reduce<Record<string, WebsiteContent>>((acc, item) => {
    acc[item.section] = item;
    return acc;
  }, {});
}

export default async function Page() {
  const [platformPayload, contentPayload] = await Promise.allSettled([
    api.get<PlatformSummary>("/api/v1/platform"),
    api.get<{ items: WebsiteContent[] }>("/api/v1/public/website-content"),
  ]);

  const platform = platformPayload.status === "fulfilled" ? platformPayload.value : null;
  const content = contentPayload.status === "fulfilled" ? sectionMap(contentPayload.value.items ?? []) : {};
  const home = content.homepage;
  const featuresSection = content.features;
  const faqSection = content.faq;
  const testimonialsSection = content.testimonials;

  const plans = platform?.plans ?? [];
  const latestGyms = platform?.latestGyms ?? [];

  return (
    <main className="page">
      <section className="hero">
        <div className="topline">
          <span className="eyebrow">QuantumFit</span>
          <span className="pill">FA / EN ready</span>
        </div>
        <h1>{home?.title ?? "Cloud intelligence for modern gym operations."}</h1>
        <p>
          {home?.subtitle ??
            "A premium multi-panel system for gym owners, trainers, athletes, and platform operators with live occupancy, onboarding, analytics, and legacy software integration."}
        </p>
        <div className="actions">
          <a className="button primary" href="/login">{home?.cta ?? "Enter panels"}</a>
          <a className="button secondary" href="/demo">See demo</a>
        </div>
        <div className="stats">
          <article>
            <strong>{platform?.gymCount ?? 0}</strong>
            <span>gyms registered</span>
          </article>
          <article>
            <strong>{platform?.activeGyms ?? 0}</strong>
            <span>active gyms</span>
          </article>
          <article>
            <strong>{plans.length}</strong>
            <span>active plans</span>
          </article>
        </div>
      </section>

      <section className="grid">
        <article className="panel card accent">
          <span className="label">Why QuantumFit</span>
          <h2>{featuresSection?.title ?? "Built for gym owners, coaches, and athletes in one stack."}</h2>
          <p>{featuresSection?.body ?? "Each subdomain owns its workflow while the backend enforces one tenant boundary everywhere."}</p>
        </article>
        <article className="panel card">
          <span className="label">Latest gyms</span>
          <ul>
            {latestGyms.length > 0 ? (
              latestGyms.slice(0, 4).map((gym) => (
                <li key={gym.id}>
                  {gym.name} · {gym.planName} · {gym.onboardingStatus}
                </li>
              ))
            ) : (
              <li>No gyms found yet.</li>
            )}
          </ul>
        </article>
      </section>

      <section className="grid">
        {(home?.features ?? featuresSection?.features ?? [
          "Gym management",
          "Trainer workflows",
          "Athlete app",
          "Live crowd tracking",
          "Smart SMS automation",
          "Analytics dashboard",
        ]).map((feature) => (
          <article key={feature} className="panel card">
            <span className="label">Feature</span>
            <h3>{feature}</h3>
            <p>Editable from the admin CMS and connected to the same backend data model.</p>
          </article>
        ))}
      </section>

      <section id="pricing" className="pricing">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <article className="pricing-card" key={plan.code}>
              <div className="pricing-head">
                <span>{plan.code}</span>
                <strong>{plan.name}</strong>
              </div>
              <p>
                {plan.currency ?? "USD"} {plan.monthlyPrice ?? 0}/mo · {plan.yearlyPrice ?? 0}/yr
              </p>
              <p>
                {Object.entries(plan.limits ?? {})
                  .map(([key, value]) => `${key}: ${String(value)}`)
                  .join(" · ") || "Plan limits are managed from the admin panel."}
              </p>
            </article>
          ))
        ) : (
          <article className="pricing-card">
            <div className="pricing-head">
              <span>Waiting for backend</span>
              <strong>No plans loaded</strong>
            </div>
            <p>Start the Go API and PostgreSQL to render live plan data from the admin panel.</p>
          </article>
        )}
      </section>

      <section className="grid">
        <article className="panel card">
          <span className="label">Testimonials</span>
          <h3>{home?.testimonials?.[0]?.name ?? testimonialsSection?.title ?? "Demo Gym"}</h3>
          <p>{home?.testimonials?.[0]?.quote ?? testimonialsSection?.body ?? "A premium and connected web platform for every gym workflow."}</p>
        </article>
        <article className="panel card">
          <span className="label">FAQ</span>
          <ul>
            {(home?.faq ?? faqSection?.faq ?? [
              { q: "Is RTL supported?", a: "Yes, Persian and English are both supported." },
              { q: "Can admins edit content?", a: "Yes, all public content is editable from the admin panel." },
            ]).map((item) => (
              <li key={item.q ?? item.question}>
                <strong>{item.q ?? item.question}</strong>
                <div style={{ color: "var(--qf-muted)", marginTop: 6 }}>{item.a ?? item.answer}</div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid">
        <article className="panel card accent">
          <span className="label">CTA</span>
          <h2>{home?.cta ?? "Request a live demo or log in to your panel."}</h2>
          <p>Public content, pricing, and demo access are managed centrally.</p>
        </article>
      </section>
    </main>
  );
}
