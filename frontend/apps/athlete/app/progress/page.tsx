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
  completedAt?: string;
};

function uniqueDays(items: AttendanceItem[]) {
  return new Set(items.map((item) => new Date(item.checkinAt).toDateString())).size;
}

export default async function Page() {
  let attendance: AttendanceItem[] = [];
  let sessions: SessionItem[] = [];
  let dashboard: { attendance?: { today: number; week: number }; occupancy?: { current: number; capacity: number; ratio: number } } | null = null;
  try {
    const [attendancePayload, sessionsPayload, dashboardPayload] = await Promise.all([
      api.get<{ items: AttendanceItem[] }>("/api/v1/attendance?limit=30"),
      api.get<{ items: SessionItem[] }>("/api/v1/sessions?limit=12"),
      api.get<{ attendance?: { today: number; week: number }; occupancy?: { current: number; capacity: number; ratio: number } }>("/api/v1/dashboard"),
    ]);
    attendance = attendancePayload.items ?? [];
    sessions = sessionsPayload.items ?? [];
    dashboard = dashboardPayload;
  } catch {
    attendance = [];
    sessions = [];
    dashboard = null;
  }

  const completedSessions = sessions.filter((session) => session.status === "completed").length;
  const attendanceStreak = uniqueDays(attendance);
  const completionRate = sessions.length > 0 ? Math.round((completedSessions / sessions.length) * 100) : 0;

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">پیشرفت</span>
        <h1>روند حضور، تکمیل سشن و فعالیت‌های اخیر.</h1>
        <p>پیشرفت از ورودها و سشن‌های محدود به مستاجر محاسبه می‌شود تا همیشه داده زنده ببینی.</p>
      </header>

      <div className="metrics">
        <article><strong>{attendanceStreak}</strong><span>روز فعال</span></article>
        <article><strong>{completedSessions}</strong><span>سشن تکمیل‌شده</span></article>
        <article><strong>{completionRate}%</strong><span>نرخ تکمیل</span></article>
        <article><strong>{dashboard?.attendance?.week ?? attendance.length}</strong><span>بازدید هفتگی</span></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>سشن‌های اخیر</span>
            <em>تاریخچه تمرین</em>
          </div>
          <ul className="timeline">
            {sessions.length > 0 ? sessions.map((session) => (
              <li key={session.id}>
                <strong>{session.dayLabel || "سشن"}</strong>
                <span>{session.title} · {session.status}</span>
                {session.completedAt ? <small style={{ color: "var(--muted)" }}>تکمیل‌شده {new Date(session.completedAt).toLocaleDateString()}</small> : null}
              </li>
            )) : (
              <li>
                <strong>هنوز سشن تمرین نداریم</strong>
                <span>وقتی برنامه فعال شود، مربی سشن‌ها را اینجا اختصاص می‌دهد.</span>
              </li>
            )}
          </ul>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>خلاصه فعالیت</span>
            <em>محاسبه‌شده از داده زنده</em>
          </div>
          <div className="field-list">
            <div><strong>امروز</strong><span>{dashboard?.attendance?.today ?? 0} ورود در مستاجر تو ثبت شده است.</span></div>
            <div><strong>روند حضور</strong><span>{attendanceStreak} روز تمرین متفاوت در فید فعلی.</span></div>
            <div><strong>تکمیل</strong><span>{completionRate}% از سشن‌های اختصاصی تکمیل شده‌اند.</span></div>
          </div>
        </section>
      </div>
    </section>
  );
}
