import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

export default async function Page() {
  let me: { userId?: string; role?: string; panel?: string; tenant?: { name?: string; slug?: string } } | null = null;
  try {
    me = await api.get("/api/v1/auth/me");
  } catch {
    me = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">پروفایل</span>
        <h1>بیو مربی و هویت حساب.</h1>
      </header>
      <div className="detail-grid">
        <article><span className="status">هویت</span><h3>{me?.role ?? "مربی"}</h3><p>{me?.userId ?? "حساب مربی واردشده"}</p></article>
        <article><span className="status">باشگاه</span><h3>{me?.tenant?.name ?? "باشگاه متصل"}</h3><p>{me?.tenant?.slug ?? "coach"} محدوده مستاجر</p></article>
        <article><span className="status">فضای کار</span><h3>{me?.panel ?? "مربی"}</h3><p>ابزارهای مربی، شاگردها و برنامه‌ها.</p></article>
      </div>
    </section>
  );
}
