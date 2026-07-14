import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

export default async function Page() {
  let health: { status?: string; startedAt?: string; uptimeSec?: number } | null = null;
  let platform: { serviceName?: string; version?: string; env?: string } | null = null;
  try {
    health = await api.get("/api/v1/health");
    platform = await api.get("/api/v1/platform");
  } catch {
    health = null;
    platform = null;
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">سیستم</span>
        <h1>سلامت پلتفرم و جزئیات اجرا.</h1>
        <p>نسخه سرویس، محیط اجرا و زمان روشن‌بودن بک‌اند Go را مانیتور کن.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">سلامت</span><h3>{health?.status ?? "نامشخص"}</h3><p>نقطه سلامت API.</p></article>
        <article><span className="status">نسخه</span><h3>{platform?.version ?? "توسعه"}</h3><p>{platform?.env ?? "محیط توسعه"}</p></article>
        <article><span className="status">زمان اجرا</span><h3>{health?.uptimeSec ?? 0}s</h3><p>زمان کارکرد بک‌اند Go.</p></article>
      </div>
    </section>
  );
}
