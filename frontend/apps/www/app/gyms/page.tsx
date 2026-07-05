import Link from "next/link";
import { createApiClient } from "@quantomfit/api-client";

type Gym = {
  id: string;
  slug: string;
  name: string;
  planName: string;
  onboardingStatus: string;
  latestOccupancy?: number;
  capacity?: number;
};

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "marketing",
  },
});

export default async function Page() {
  let gyms: Gym[] = [];
  try {
    const payload = await api.get<{ items: Gym[] }>("/api/v1/public/gyms");
    gyms = payload.items ?? [];
  } catch {
    gyms = [];
  }

  return (
    <section className="page-section">
      <span className="kicker">Gyms</span>
      <h1>Discover public gym profiles.</h1>
      <p>Profiles are read from the same tenant database and can later be expanded with reviews and map data.</p>
      <div className="copy-grid">
        {gyms.length > 0 ? gyms.map((gym) => (
          <article key={gym.id}>
            <h3>{gym.name}</h3>
            <p>{gym.planName} · {gym.onboardingStatus}</p>
            <p>{gym.latestOccupancy ?? 0} / {gym.capacity ?? 0} live occupancy</p>
            <Link className="button secondary" href={`/gyms/${gym.slug}`}>Open profile</Link>
          </article>
        )) : (
          <article>
            <h3>No public gyms yet</h3>
            <p>Once gyms are approved and activated, they appear here automatically.</p>
          </article>
        )}
      </div>
    </section>
  );
}
