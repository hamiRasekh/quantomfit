import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page() {
  let onboarding: { status?: string; step?: string } | null = null;
  let dashboard: { gymName?: string } | null = null;
  try {
    const [onboardingPayload, dashboardPayload] = await Promise.all([
      api.get<{ status?: string; step?: string }>("/api/v1/onboarding/state"),
      api.get<{ gymName?: string }>("/api/v1/dashboard"),
    ]);
    onboarding = onboardingPayload;
    dashboard = dashboardPayload;
  } catch {
    onboarding = null;
    dashboard = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">تنظیمات</span>
        <h1>تنظیمات پنل و هویت باشگاه.</h1>
      </header>
      <div className="detail-grid">
        <article><span className="status">باشگاه</span><h3>{dashboard?.gymName ?? "باشگاه متصل"}</h3><p>از روی host یا هدر پنل تشخیص داده می‌شود.</p></article>
        <article><span className="status">راه‌اندازی</span><h3>{onboarding?.status ?? "ایجادشده"}</h3><p>وضعیت فعلی راه‌اندازی در PostgreSQL.</p></article>
        <article><span className="status">مرحله</span><h3>{onboarding?.step ?? "gym_name"}</h3><p>مرحله بعدی در ویزارد.</p></article>
      </div>
    </section>
  );
}
