import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type GymItem = {
  id: string;
  name: string;
  slug: string;
  planName: string;
  onboardingStatus: string;
  subscriptionStatus: string;
};

export default async function Page({ params }: { params: { gymId: string } }) {
  const { gymId } = params;
  let gym: GymItem | null = null;

  try {
    const payload = await api.get<{ items: GymItem[] }>("/api/v1/admin/gyms");
    gym = (payload.items ?? []).find((item) => item.id === gymId) ?? null;
  } catch {
    gym = null;
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">Gym detail</span>
        <h1>{gym?.name ?? "Gym not found"}</h1>
        <p>{gym?.slug ?? gymId}</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">Plan</span><h3>{gym?.planName ?? "n/a"}</h3><p>Current subscription plan.</p></article>
        <article><span className="status">Onboarding</span><h3>{gym?.onboardingStatus ?? "n/a"}</h3><p>Activation stage.</p></article>
        <article><span className="status">Subscription</span><h3>{gym?.subscriptionStatus ?? "n/a"}</h3><p>Billing state.</p></article>
      </div>
    </section>
  );
}
