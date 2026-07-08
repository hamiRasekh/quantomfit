import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

type Dashboard = {
  gymName?: string;
  members?: { total: number; active: number; newThisMonth: number };
  trainers?: number;
  attendance?: { today: number; week: number };
  occupancy?: { current: number; capacity: number; ratio: number };
  latestCheckins?: Array<{ id: string; memberName: string; checkinAt: string; source: string }>;
};

export default async function Page() {
  let dashboard: Dashboard | null = null;
  let students: Array<{ id: string; fullName: string; status: string }> = [];

  try {
    const [dashboardPayload, studentsPayload] = await Promise.all([
      api.get<Dashboard>("/api/v1/dashboard"),
      api.get<{ items: typeof students }>("/api/v1/members?limit=6"),
    ]);
    dashboard = dashboardPayload;
    students = studentsPayload.items ?? [];
  } catch {
    dashboard = null;
    students = [];
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">پنل مربی</span>
        <h1>فضای مربی برای اعضا، برنامه‌ها و سشن‌ها.</h1>
        <p>شاگردهای اختصاصی، نشانه‌های پیشرفت و حضور و غیاب زنده فقط برای همان باشگاه نمایش داده می‌شود.</p>
      </header>

      <div className="metrics">
        <article><strong>{dashboard?.members?.active ?? 0}</strong><span>ورزشکار فعال</span></article>
        <article><strong>{dashboard?.attendance?.today ?? 0}</strong><span>ورودی امروز</span></article>
        <article><strong>{dashboard?.trainers ?? 0}</strong><span>صندلی مربی</span></article>
        <article><strong>{dashboard?.occupancy?.ratio ? `${Math.round(dashboard.occupancy.ratio * 100)}%` : "0%"}</strong><span>نرخ استفاده</span></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>امروز</span>
            <em>{dashboard?.gymName ?? "باشگاه متصل"}</em>
          </div>
          <div className="field-list">
            <div><strong>سشن‌ها</strong><span>{dashboard?.attendance?.today ?? 0} تمرین امروز ثبت شده است.</span></div>
            <div><strong>شلوغی زنده</strong><span>{dashboard?.occupancy?.current ?? 0} نفر از {dashboard?.occupancy?.capacity ?? 0} ظرفیت داخل‌اند.</span></div>
            <div><strong>رشد</strong><span>{dashboard?.members?.newThisMonth ?? 0} عضو جدید در این ماه اضافه شده است.</span></div>
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>شاگردها</span>
            <em>اختصاص‌داده‌شده به شما</em>
          </div>
          <div className="list">
            {students.length > 0 ? students.slice(0, 4).map((student) => (
              <div key={student.id}><strong>{student.fullName}</strong><span>{student.status}</span></div>
            )) : (
              <div><strong>هنوز شاگردی ثبت نشده</strong><span>اعضای اولیه باشگاه اینجا نمایش داده می‌شوند.</span></div>
            )}
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>فعالیت اخیر</span><em>فید زنده</em></div>
          <ul className="timeline">
            {(dashboard?.latestCheckins ?? []).slice(0, 4).map((item) => (
              <li key={item.id}>
                <strong>{new Date(item.checkinAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
                <span>{item.memberName} · {item.source}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <div className="section-head"><span>اقدام بعدی</span><em>جریان مربی</em></div>
          <div className="detail-grid">
            <article><span className="status">ساخت</span><h3>برنامه تمرینی</h3><p>از بخش برنامه‌ها یک برنامه جدید بساز و اختصاص بده.</p></article>
            <article><span className="status">بررسی</span><h3>پیشرفت شاگرد</h3><p>فهرست شاگردها را برای جزئیات و پایبندی باز کن.</p></article>
            <article><span className="status">پایش</span><h3>حضور و غیاب</h3><p>از تاریخچه حضور برای تنظیم مربی‌گری استفاده کن.</p></article>
          </div>
        </section>
      </div>
    </section>
  );
}
