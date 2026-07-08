import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page() {
  let dashboard: { attendance?: { today: number; week: number }; realtime?: { checkinsPerMinute: number } } | null = null;
  try {
    dashboard = await api.get("/api/v1/dashboard");
  } catch {
    dashboard = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">گزارش‌ها</span>
        <h1>گزارش‌های عملیاتی برای همین باشگاه.</h1>
        <p>نمایش KPIهای آماده‌ی خروجی برای عملیات روزانه و مرور هفتگی.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">امروز</span><h3>{dashboard?.attendance?.today ?? 0}</h3><p>ورود امروز.</p></article>
        <article><span className="status">هفته</span><h3>{dashboard?.attendance?.week ?? 0}</h3><p>ورود این هفته.</p></article>
        <article><span className="status">نرخ</span><h3>{dashboard?.realtime?.checkinsPerMinute ?? 0}</h3><p>ورود در دقیقه.</p></article>
      </div>
    </section>
  );
}
