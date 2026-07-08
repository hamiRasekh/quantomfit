import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page() {
  let occupancy: {
    current?: number;
    capacity?: number;
    ratio?: number;
    heatmap?: Array<{ zone: string; value: number }>;
  } | null = null;

  try {
    occupancy = await api.get("/api/v1/occupancy/current");
  } catch {
    occupancy = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">تراکم</span>
        <h1>تراکم زنده بر اساس دروازه و زون سالن.</h1>
      </header>
      <div className="detail-grid">
        <article><span className="status">فعلی</span><h3>{occupancy?.current ?? 0}</h3><p>ورودی‌های فعال داخل باشگاه.</p></article>
        <article><span className="status">ظرفیت</span><h3>{occupancy?.capacity ?? 0}</h3><p>سقف قطعی از پروفایل راه‌اندازی.</p></article>
        <article><span className="status">نسبت</span><h3>{occupancy?.ratio ? `${Math.round(occupancy.ratio * 100)}%` : "0%"}</h3><p>استفاده لحظه‌ای از ظرفیت.</p></article>
      </div>
    </section>
  );
}
