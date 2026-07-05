import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "marketing",
  },
});

type WebsiteContent = {
  title: string;
  subtitle: string;
  body: string;
  features?: string[];
};

export default async function Page() {
  let features: WebsiteContent | null = null;
  try {
    const payload = await api.get<{ items: Array<WebsiteContent & { section: string }> }>("/api/v1/public/website-content");
    features = payload.items.find((item) => item.section === "features") ?? null;
  } catch {
    features = null;
  }

  const cards = [
    "Gym management",
    "Trainer management",
    "Athlete experience",
    "Live occupancy",
    "Equipment management",
    "QR attendance",
    "Smart SMS",
    "Analytics",
    "Lobby dashboard",
  ];

  return (
    <section className="page-section">
      <span className="kicker">Features</span>
      <h1>{features?.title ?? "Everything a gym needs, from day zero to scale."}</h1>
      <p>{features?.subtitle ?? "QuantumFit keeps the marketing site, admin panel, gym panel, trainer panel, and athlete app connected through one backend."}</p>
      <div className="copy-grid">
        {cards.map((item) => (
          <article key={item}>
            <h3>{item}</h3>
            <p>Editable from the admin CMS and reflected across the full ecosystem.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
