import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

type AttendanceItem = {
  id: string;
  memberName: string;
  checkinAt: string;
  source: string;
};

type SessionItem = {
  id: string;
  title: string;
  dayLabel: string;
  status: string;
};

function latestTimeLabel(value?: string) {
  return value ? new Date(value).toLocaleString() : "";
}

export default async function Page() {
  let attendance: AttendanceItem[] = [];
  let sessions: SessionItem[] = [];
  let dashboard: { attendance?: { today: number; week: number }; occupancy?: { current: number; capacity: number } } | null = null;
  try {
    const [attendancePayload, sessionsPayload, dashboardPayload] = await Promise.all([
      api.get<{ items: AttendanceItem[] }>("/api/v1/attendance?limit=5"),
      api.get<{ items: SessionItem[] }>("/api/v1/sessions?limit=5"),
      api.get<{ attendance?: { today: number; week: number }; occupancy?: { current: number; capacity: number } }>("/api/v1/dashboard"),
    ]);
    attendance = attendancePayload.items ?? [];
    sessions = sessionsPayload.items ?? [];
    dashboard = dashboardPayload;
  } catch {
    attendance = [];
    sessions = [];
    dashboard = null;
  }

  const latestCheckin = attendance[0];
  const reminders = [
    {
      title: "Workout reminder",
      body: sessions[0] ? `${sessions[0].title} is ready in your current program.` : "No assigned workout session yet.",
      time: "",
    },
    {
      title: "Attendance summary",
      body: dashboard ? `${dashboard.attendance?.week ?? 0} visits this week and ${dashboard.attendance?.today ?? 0} today.` : "No live attendance summary available.",
      time: latestCheckin ? latestTimeLabel(latestCheckin.checkinAt) : "",
    },
    {
      title: "Gym crowd",
      body: dashboard?.occupancy ? `${dashboard.occupancy.current} of ${dashboard.occupancy.capacity} members are inside right now.` : "Live crowd data is not available yet.",
      time: "",
    },
  ];

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Notifications</span>
        <h1>Personal reminders and live gym updates.</h1>
        <p>All entries are derived from the active tenant's live data so the feed stays accurate and isolated.</p>
      </header>

      <div className="panel">
        <div className="section-head">
          <span>Recent feed</span>
          <em>{attendance.length + sessions.length} live signals</em>
        </div>
        <div className="field-list">
          {reminders.map((item) => (
            <div key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
              {item.time ? <small style={{ color: "var(--muted)" }}>{item.time}</small> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
