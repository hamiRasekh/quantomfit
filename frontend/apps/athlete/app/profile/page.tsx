import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

export default async function Page() {
  let me: { userId?: string; role?: string; panel?: string; tenant?: { name?: string; slug?: string } } | null = null;
  let dashboard: { attendance?: { today: number; week: number }; occupancy?: { current: number; capacity: number } } | null = null;

  try {
    const [mePayload, dashboardPayload] = await Promise.all([
      api.get<{ userId?: string; role?: string; panel?: string; tenant?: { name?: string; slug?: string } }>("/api/v1/auth/me"),
      api.get<{ attendance?: { today: number; week: number }; occupancy?: { current: number; capacity: number } }>("/api/v1/dashboard"),
    ]);
    me = mePayload;
    dashboard = dashboardPayload;
  } catch {
    me = null;
    dashboard = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">پروفایل</span>
        <h1>تنظیمات شخصی و دسترسی حساب.</h1>
      </header>
      <div className="detail-grid">
        <article><span className="status">هویت</span><h3>{me?.role ?? "ورزشکار"}</h3><p>{me?.userId ?? "حساب عضو"}</p></article>
        <article><span className="status">باشگاه</span><h3>{me?.tenant?.name ?? "باشگاه متصل"}</h3><p>{me?.tenant?.slug ?? "app"} محدوده مستاجر</p></article>
        <article><span className="status">فعالیت</span><h3>{dashboard?.attendance?.week ?? 0} بازدید</h3><p>{dashboard?.occupancy?.current ?? 0} از {dashboard?.occupancy?.capacity ?? 0} داخل هستند.</p></article>
      </div>
    </section>
  );
}
