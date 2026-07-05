import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

export default async function Page() {
  let attendance: Array<{ id: string; memberName: string; checkinAt: string; source: string }> = [];
  try {
    const payload = await api.get<{ items: typeof attendance }>("/api/v1/attendance?limit=20");
    attendance = payload.items ?? [];
  } catch {
    attendance = [];
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Attendance</span>
        <h1>Your check-in history and attendance streak.</h1>
      </header>
      <div className="panel">
        <div className="section-head"><span>Latest check-ins</span><em>{attendance.length} entries</em></div>
        <ul className="timeline">
          {attendance.length > 0 ? attendance.map((item) => (
            <li key={item.id}>
              <strong>{new Date(item.checkinAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
              <span>{item.memberName} · {item.source}</span>
            </li>
          )) : (
            <li>
              <strong>No attendance yet</strong>
              <span>Your check-in feed will appear here.</span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
