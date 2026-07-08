import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Program = {
  id: string;
  name: string;
  status: string;
  trainerId?: string;
  trainerName?: string;
  createdAt?: string;
};

type Session = {
  id: string;
  title: string;
  dayLabel: string;
  status: string;
  notes?: string;
  completedAt?: string;
};

export default async function Page({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;

  let program: Program | null = null;
  let sessions: Session[] = [];
  try {
    const [programPayload, sessionsPayload] = await Promise.all([
      api.get<Program>(`/api/v1/programs/${programId}`),
      api.get<{ items: Session[] }>(`/api/v1/programs/${programId}/sessions?limit=24`),
    ]);
    program = programPayload;
    sessions = sessionsPayload.items ?? [];
  } catch {
    program = null;
    sessions = [];
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Program detail</span>
        <h1>{program?.name ?? "Workout program"}</h1>
        <p>Weekly structure, assignments, and session history for this tenant-scoped program.</p>
      </header>

      <div className="metrics">
        <article><strong>{sessions.length}</strong><span>sessions</span></article>
        <article><strong>{sessions.filter((item) => item.status === "completed").length}</strong><span>completed</span></article>
        <article><strong>{program?.status ?? "unknown"}</strong><span>status</span></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Program info</span>
            <em>{program?.trainerName ?? "Unassigned"}</em>
          </div>
          <div className="field-list">
            <div><strong>Trainer</strong><span>{program?.trainerName ?? "No trainer assigned"}</span></div>
            <div><strong>Status</strong><span>{program?.status ?? "unknown"}</span></div>
            <div><strong>Program ID</strong><span>{program?.id ?? programId}</span></div>
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>Sessions</span>
            <em>Weekly flow</em>
          </div>
          <ul className="timeline">
            {sessions.length > 0 ? sessions.map((session) => (
              <li key={session.id}>
                <strong>{session.dayLabel || "Session"}</strong>
                <span>{session.title} · {session.status}{session.completedAt ? ` · completed ${new Date(session.completedAt).toLocaleDateString()}` : ""}</span>
                {session.notes ? <p style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>{session.notes}</p> : null}
              </li>
            )) : (
              <li>
                <strong>No sessions yet</strong>
                <span>Create sessions from the program to start tracking progress.</span>
              </li>
            )}
          </ul>
        </section>
      </div>
    </section>
  );
}
