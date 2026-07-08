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
        <span className="label">تقویم</span>
        <h1>سشن‌ها، کلاس‌ها و برنامه تمرینی.</h1>
        <p>هفته را با سشن‌های زنده‌ی مستاجر باشگاه برنامه‌ریزی کن.</p>
      </header>
      <div className="detail-grid">
        {sessions.length > 0 ? sessions.slice(0, 3).map((session) => (
          <article key={session.id}>
            <span className="status">{session.dayLabel || "سشن"}</span>
            <h3>{session.title}</h3>
            <p>{session.status}{session.notes ? ` · ${session.notes}` : ""}</p>
          </article>
        )) : (
          <>
            <article><span className="status">صبح</span><h3>جلسه قدرت</h3><p>بلاک عضو اختصاص‌داده‌شده ساعت ۰۷:۰۰.</p></article>
            <article><span className="status">عصر</span><h3>کوچینگ عملکردی</h3><p>کار گروه کوچک ساعت ۱۶:۳۰.</p></article>
            <article><span className="status">شب</span><h3>بررسی ریکاوری</h3><p>موبیلیتی و مرور پیشرفت ساعت ۲۰:۰۰.</p></article>
          </>
        )}
      </div>
    </section>
  );
}
