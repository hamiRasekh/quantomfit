import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page() {
  let attendance: Array<{ id: string; memberName: string; checkinAt: string; source: string }> = [];
  try {
    const payload = await api.get<{ items: typeof attendance }>("/api/v1/attendance?limit=24");
    attendance = payload.items ?? [];
  } catch {
    attendance = [];
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Attendance</span>
        <h1>Live check-in history and daily traffic inside one tenant.</h1>
        <p>Monitor gate entries, member activity, and operational traffic in a single tenant-scoped timeline.</p>
      </header>
      <div className="panel">
        <div className="section-head">
          <span>Latest check-ins</span>
          <em>Tenant scoped</em>
        </div>
        <ul className="timeline">
          {attendance.length > 0 ? attendance.map((item) => (
            <li key={item.id}>
              <strong>{new Date(item.checkinAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
              <span>{item.memberName} · {item.source}</span>
            </li>
          )) : (
            <li>
              <strong>No check-ins yet</strong>
              <span>Attendance logs will appear here once seeded.</span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
