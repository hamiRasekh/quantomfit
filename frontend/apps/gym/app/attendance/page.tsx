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
        <span className="label">حضور و غیاب</span>
        <h1>تاریخچه ورود زنده و ترافیک روزانه داخل همین باشگاه.</h1>
        <p>ورود دروازه، فعالیت اعضا و ترافیک عملیاتی را در یک تایم‌لاینِ محدود به همین tenant ببین.</p>
      </header>
      <div className="panel">
        <div className="section-head">
          <span>آخرین ورودها</span>
          <em>محدوده باشگاه</em>
        </div>
        <ul className="timeline">
          {attendance.length > 0 ? attendance.map((item) => (
            <li key={item.id}>
              <strong>{new Date(item.checkinAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
              <span>{item.memberName} · {item.source === "gate" ? "دروازه" : item.source === "app" ? "اپ" : item.source}</span>
            </li>
          )) : (
            <li>
              <strong>هنوز ورودی ثبت نشده</strong>
              <span>وقتی دیتابیس seed شود، لاگ حضور اینجا نمایش داده می‌شود.</span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
