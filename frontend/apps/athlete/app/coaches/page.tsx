import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

export default async function Page() {
  let coaches: Array<{ id: string; fullName: string; specialty?: string; status: string }> = [];
  try {
    const payload = await api.get<{ items: typeof coaches }>("/api/v1/trainers?limit=24");
    coaches = payload.items ?? [];
  } catch {
    coaches = [];
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Coaches</span>
        <h1>Your assigned trainers.</h1>
      </header>
      <div className="detail-grid">
        {coaches.slice(0, 3).map((coach) => (
          <article key={coach.id}>
            <span className="status">{coach.specialty ?? "Coach"}</span>
            <h3>{coach.fullName}</h3>
            <p>{coach.status}</p>
          </article>
        ))}
        {coaches.length === 0 ? (
          <>
            <article><span className="status">Lead coach</span><h3>Sara Amini</h3><p>Strength and technique focus.</p></article>
            <article><span className="status">Support coach</span><h3>Navid Hosseini</h3><p>Functional and mobility sessions.</p></article>
            <article><span className="status">Message</span><h3>Direct contact</h3><p>Trainer profile cards can be connected to messages later.</p></article>
          </>
        ) : null}
      </div>
    </section>
  );
}
