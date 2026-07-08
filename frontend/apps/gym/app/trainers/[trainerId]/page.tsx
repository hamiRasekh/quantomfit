import { createApiClient } from "@quantomfit/api-client";

type TrainerDetail = {
  id: string;
  fullName: string;
  specialty?: string;
  status: string;
};

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page({ params }: { params: Promise<{ trainerId: string }> }) {
  const { trainerId } = await params;
  let trainer: TrainerDetail | null = null;
  try {
    trainer = await api.get<TrainerDetail>(`/api/v1/trainers/${trainerId}`);
  } catch {
    trainer = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Trainer detail</span>
        <h1>{trainer?.fullName ?? `Trainer ${trainerId}`}</h1>
        <p>Specialty, schedule, and member assignments inside one gym tenant.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">Specialty</span><h3>{trainer?.specialty ?? "General coaching"}</h3><p>Focus area resolved from tenant data.</p></article>
        <article><span className="status">Status</span><h3>{trainer?.status ?? "active"}</h3><p>Current trainer state.</p></article>
        <article><span className="status">ID</span><h3>{trainer?.id ?? trainerId}</h3><p>Tenant scoped record.</p></article>
      </div>
      <div className="panel">
        <div className="section-head">
          <span>Summary</span>
          <em>Tenant scoped profile</em>
        </div>
        <div className="qf-grid qf-grid--2">
          <article className="panel">
            <span className="status">Sessions</span>
            <h3 style={{ marginTop: 14 }}>Training load</h3>
            <p style={{ color: "var(--qf-muted)", lineHeight: 1.7 }}>Weekly sessions, assigned students, and notes are tracked from the gym panel.</p>
          </article>
          <article className="panel">
            <span className="status">Availability</span>
            <h3 style={{ marginTop: 14 }}>Schedule</h3>
            <p style={{ color: "var(--qf-muted)", lineHeight: 1.7 }}>Availability and class coverage are rendered here for fast coordination.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
