import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

type Dashboard = {
  gymName?: string;
  attendance?: { today: number; week: number };
  occupancy?: { current: number; capacity: number; ratio: number };
  latestCheckins?: Array<{ id: string; memberName: string; checkinAt: string; source: string }>;
};

export default async function Page() {
  let dashboard: Dashboard | null = null;
  try {
    dashboard = await api.get("/api/v1/dashboard");
  } catch {
    dashboard = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">اپ ورزشکار</span>
        <h1>{dashboard?.gymName ?? "باشگاه شما"} در یک فضای کاملاً آماده موبایل.</h1>
        <p>تمرین، حضور و غیاب، وضعیت شلوغی، اعلان‌ها و پیشرفت در پنل ورزشکار کنار هم قرار گرفته‌اند.</p>
      </header>

      <div className="metrics">
        <article><strong>{dashboard?.attendance?.today ?? 0}</strong><span>جلسه امروز</span></article>
        <article><strong>{dashboard?.attendance?.week ?? 0}</strong><span>جلسه این هفته</span></article>
        <article><strong>{dashboard?.occupancy?.current ?? 0}</strong><span>شلوغی فعلی</span></article>
        <article><strong>{dashboard?.occupancy?.ratio ? `${Math.round(dashboard.occupancy.ratio * 100)}%` : "0%"}</strong><span>نرخ استفاده</span></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>امروز</span>
            <em>برنامه شخصی</em>
          </div>
          <div className="field-list">
            <div><strong>ورود امروز</strong><span>{dashboard?.attendance?.today ?? 0}</span></div>
            <div><strong>روند هفتگی</strong><span>{dashboard?.attendance?.week ?? 0} بار در این هفته وارد شده‌ای.</span></div>
            <div><strong>شلوغی باشگاه</strong><span>{dashboard?.occupancy?.current ?? 0} نفر از {dashboard?.occupancy?.capacity ?? 0} داخل هستند.</span></div>
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>اقدام سریع</span>
            <em>جریان عضو</em>
          </div>
          <div className="detail-grid">
            <article><span className="status">تمرین</span><h3>باز کردن برنامه</h3><p>برنامه امروز را مرور کن و انجام آن را ثبت کن.</p></article>
            <article><span className="status">پیگیری</span><h3>حضور و غیاب</h3><p>ورودی‌ها و روند فعلی‌ات را ببین.</p></article>
            <article><span className="status">ارتباط</span><h3>باشگاه من</h3><p>پروفایل باشگاه، مربی‌ها و وضعیت شلوغی را ببین.</p></article>
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>ورودهای اخیر</span><em>محدود به باشگاه</em></div>
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
          <div className="section-head"><span>پیشرفت</span><em>خلاصه زنده</em></div>
          <div className="detail-grid">
            <article><span className="status">وضعیت</span><h3>متصل</h3><p>حساب شما فقط به همان مستاجر باشگاه لینک شده است.</p></article>
            <article><span className="status">عضویت</span><h3>اشتراک فعلی</h3><p>جزئیات عضویت می‌تواند اینجا نمایش داده شود.</p></article>
            <article><span className="status">QR</span><h3>کد ورود</h3><p>ورود با QR از همین پنل قابل نمایش است.</p></article>
          </div>
        </section>
      </div>
    </section>
  );
}
