import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page() {
  let analytics: { series?: Array<{ label: string; value: number }>; kpis?: Record<string, number> } | null = null;
  try {
    analytics = await api.get("/api/v1/analytics/dashboard");
  } catch {
    analytics = null;
  }

  const series = analytics?.series ?? [];
  const kpis = analytics?.kpis ?? {};

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">تحلیل</span>
        <h1>تحلیل عملیاتی و سیگنال‌های حفظ عضو.</h1>
        <p>حضور، ماندگاری، روند درآمد و سیگنال‌های تراکم زنده را از یک داشبورد محدوده‌دار پیگیری کن.</p>
      </header>

      <div className="panel">
        <div className="section-head">
          <span>سری‌ها</span>
          <em>روند ۷ روزه</em>
        </div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>برچسب</strong>
            <strong>مقدار</strong>
            <strong>سیگنال</strong>
          </div>
          {series.length > 0 ? series.map((point) => (
            <div className="qf-table__row" key={point.label}>
              <span><strong>{point.label}</strong></span>
              <span>{point.value}</span>
              <span>ردیابی‌شده</span>
            </div>
          )) : (
            <div className="qf-table__row">
              <span>
                <strong>داده سری وجود ندارد</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>وقتی رویدادهای حضور فعال شوند، تحلیل‌ها نمایش داده می‌شوند.</small>
              </span>
              <span>--</span>
              <span>--</span>
            </div>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <article><span className="status">رشد درآمد</span><h3>{kpis.revenueGrowth ?? 0}%</h3><p>توسط لایه تحلیل پلتفرم مدیریت می‌شود.</p></article>
        <article><span className="status">ماندگاری</span><h3>{kpis.memberRetention ?? 0}%</h3><p>از فعالیت و حضور باشگاه استخراج می‌شود.</p></article>
        <article><span className="status">اوج تراکم</span><h3>{kpis.occupancyPeak ? `${Math.round(kpis.occupancyPeak * 100)}%` : "0%"}</h3><p>بر پایه اسنپ‌شات‌های زنده تراکم.</p></article>
      </div>
    </section>
  );
}
