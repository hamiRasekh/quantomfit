import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

type Session = {
  id: string;
  title: string;
  dayLabel: string;
  status: string;
  notes?: string;
};

export default async function Page() {
  let sessions: Session[] = [];
  try {
    const payload = await api.get<{ items: Session[] }>("/api/v1/sessions?limit=24");
    sessions = payload.items ?? [];
  } catch {
    sessions = [];
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Calendar</span>
        <h1>Sessions, classes, and training schedule.</h1>
        <p>Plan the week using live sessions from the connected gym tenant.</p>
      </header>
      <div className="detail-grid">
        {sessions.length > 0 ? sessions.slice(0, 3).map((session) => (
          <article key={session.id}>
            <span className="status">{session.dayLabel || "Session"}</span>
            <h3>{session.title}</h3>
            <p>{session.status}{session.notes ? ` · ${session.notes}` : ""}</p>
          </article>
        )) : (
          <>
            <article><span className="status">Morning</span><h3>Strength session</h3><p>Assigned member block at 07:00.</p></article>
            <article><span className="status">Afternoon</span><h3>Functional coaching</h3><p>Small group work at 16:30.</p></article>
            <article><span className="status">Evening</span><h3>Recovery check</h3><p>Mobility and progress review at 20:00.</p></article>
          </>
        )}
      </div>
    </section>
  );
}
