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
      title: "یادآور تمرین",
      body: sessions[0] ? `${sessions[0].title} در برنامه فعلی تو آماده است.` : "هنوز سشن تمرینی اختصاص داده نشده.",
      time: "",
    },
    {
      title: "خلاصه حضور",
      body: dashboard ? `${dashboard.attendance?.week ?? 0} بازدید این هفته و ${dashboard.attendance?.today ?? 0} امروز.` : "خلاصه حضور زنده در دسترس نیست.",
      time: latestCheckin ? latestTimeLabel(latestCheckin.checkinAt) : "",
    },
    {
      title: "شلوغی باشگاه",
      body: dashboard?.occupancy ? `${dashboard.occupancy.current} از ${dashboard.occupancy.capacity} نفر الان داخل‌اند.` : "داده شلوغی زنده هنوز موجود نیست.",
      time: "",
    },
  ];

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">اعلان‌ها</span>
        <h1>یادآورهای شخصی و به‌روزرسانی‌های زنده باشگاه.</h1>
        <p>همه ورودی‌ها از داده زنده مستاجر فعال می‌آیند تا فید دقیق و ایزوله بماند.</p>
      </header>

      <div className="panel">
        <div className="section-head">
          <span>فید اخیر</span>
          <em>{attendance.length + sessions.length} سیگنال زنده</em>
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
