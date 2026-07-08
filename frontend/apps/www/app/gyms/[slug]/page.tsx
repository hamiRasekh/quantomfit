import { createApiClient } from "@quantomfit/api-client";

type PublicGymProfile = {
  gym: {
    slug: string;
    name: string;
    planName: string;
    onboardingStatus: string;
    latestOccupancy?: number;
    capacity?: number;
  };
  onboarding?: {
    payload?: Record<string, unknown>;
  };
  equipment?: Array<{ id: string; name: string; category?: string; quantity: number; status: string }>;
  trainers?: Array<{ id: string; fullName: string; specialty?: string; status: string }>;
  classes?: Array<{ id: string; title: string; capacity: number; schedule: string; status: string }>;
};

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "marketing",
  },
});

function getString(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key];
  return typeof value === "string" ? value : "";
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let profile: PublicGymProfile | null = null;
  try {
    profile = await api.get<PublicGymProfile>(`/api/v1/public/gyms/${slug}`);
  } catch {
    profile = null;
  }

  const payload = profile?.onboarding?.payload ?? {};

  return (
    <section className="page-section">
      <span className="kicker">Gym profile</span>
      <h1>{profile?.gym.name ?? slug}</h1>
      <p>{getString(payload, "gymName") || "Public gym profile with classes, trainers, and live crowd status."}</p>
      <div className="detail-grid">
        <article><span className="status">Location</span><h3>{getString(payload, "location") || "Shared public profile"}</h3><p>Address and map data can be added from onboarding.</p></article>
        <article><span className="status">Crowd</span><h3>{profile?.gym.latestOccupancy ?? 0} / {profile?.gym.capacity ?? 0}</h3><p>Live occupancy from the tenant dashboard.</p></article>
        <article><span className="status">Hours</span><h3>{getString(payload, "workingHours") || "Configured in gym panel"}</h3><p>Public working hours reflect onboarding and settings.</p></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Equipment</span><em>{profile?.equipment?.length ?? 0} items</em></div>
          <div className="field-list">
            {(profile?.equipment ?? []).slice(0, 4).map((item) => (
              <div key={item.id}>
                <strong>{item.name}</strong>
                <span>{item.category ?? "Equipment"} · {item.quantity}</span>
              </div>
            ))}
            {(profile?.equipment?.length ?? 0) === 0 ? <div><strong>No equipment exposed yet</strong><span>Gym owner can publish equipment here later.</span></div> : null}
          </div>
        </section>
        <section className="panel">
          <div className="section-head"><span>Trainers</span><em>{profile?.trainers?.length ?? 0} people</em></div>
          <div className="field-list">
            {(profile?.trainers ?? []).slice(0, 4).map((trainer) => (
              <div key={trainer.id}>
                <strong>{trainer.fullName}</strong>
                <span>{trainer.specialty ?? "General coaching"} · {trainer.status}</span>
              </div>
            ))}
            {(profile?.trainers?.length ?? 0) === 0 ? <div><strong>No trainers exposed yet</strong><span>Published from gym panel later.</span></div> : null}
          </div>
        </section>
      </div>

      <div className="panel">
        <div className="section-head"><span>Classes</span><em>{profile?.classes?.length ?? 0} sessions</em></div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>Class</strong>
            <strong>Schedule</strong>
            <strong>Status</strong>
          </div>
          {(profile?.classes ?? []).slice(0, 6).map((item) => (
            <div className="qf-table__row" key={item.id}>
              <span><strong>{item.title}</strong></span>
              <span>{item.schedule}</span>
              <span>{item.status}</span>
            </div>
          ))}
          {(profile?.classes?.length ?? 0) === 0 ? (
            <div className="qf-table__row">
              <span>No classes published</span>
              <span>—</span>
              <span>—</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
